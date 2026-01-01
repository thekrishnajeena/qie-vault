// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QIEVaultPro is ERC1155, Ownable {
    mapping(uint256 => string) public documentCids;
    mapping(uint256 => address) public documentCreator;
    mapping(uint256 => bool) public isSingleMode;
    
    // Tracks the current unique key holder for Exclusive Mode
    mapping(uint256 => address) public currentExclusiveHolder;

    constructor() ERC1155("") Ownable(msg.sender) {}

    function createDocument(uint256 documentId, string memory ipfsCid, bool singleMode) public {
        require(documentCreator[documentId] == address(0), "DOC_EXISTS");
        
        documentCreator[documentId] = msg.sender;
        documentCids[documentId] = ipfsCid;
        isSingleMode[documentId] = singleMode;
        
        _mint(msg.sender, documentId, 1, "");
        if(singleMode) currentExclusiveHolder[documentId] = msg.sender;
    }

    function grantAccess(address[] memory users, uint256 documentId) public {
        require(documentCreator[documentId] == msg.sender, "NOT_ADMIN");
        
        if (isSingleMode[documentId]) {
            require(users.length == 1, "SINGLE_MODE_ONLY_ONE_USER");
            
            // MASTER OVERRIDE: Reclaim the key from whoever has it
            address oldHolder = currentExclusiveHolder[documentId];
            if (oldHolder != address(0) && balanceOf(oldHolder, documentId) > 0) {
                _burn(oldHolder, documentId, 1);
            }
            
            // Re-issue to the new user (or back to Admin)
            _mint(users[0], documentId, 1, "");
            currentExclusiveHolder[documentId] = users[0];
        } else {
            for (uint i = 0; i < users.length; i++) {
                _mint(users[i], documentId, 1, "");
            }
        }
    }

    function revokeAccess(address user, uint256 documentId) public {
        require(documentCreator[documentId] == msg.sender, "NOT_ADMIN");
        _burn(user, documentId, 1);
        if(isSingleMode[documentId] && currentExclusiveHolder[documentId] == user) {
            currentExclusiveHolder[documentId] = address(0);
        }
    }

    // Prevents viewers from transferring their keys. Admin is exempt.
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        require(msg.sender == documentCreator[id], "TOKEN_IS_SOULBOUND");
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function canAccess(address user, uint256 documentId) public view returns (bool) {
        return balanceOf(user, documentId) > 0;
    }
}