// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "./BaseTest.sol";

contract TreasuryTest is BaseTest {
    function setUp() public override {
        super.setUp();
    }

    // --------------------------- INITIALIZE FUNCTION ----------------------------

    /**
     * @notice tests the behavior of initialize function if called twice
     */
    function testInitializeShouldRevertIfCalledTwice() public {
        vm.startPrank(owner);
        vm.expectRevert();
        Treasury(treasuryProxyAddress).initialize(
            wston,
            nftfactoryProxyAddress
        );
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of setAssetFactory function
     */
    function testSetAssetFactory() public {
        vm.startPrank(owner);
        Treasury(treasuryProxyAddress).setNftFactory(user1);
        vm.stopPrank();
        assert(Treasury(treasuryProxyAddress).getNFTFactoryAddress() == user1);
    }

    /**
     * @notice tests the behavior of setWston function
     */
    function testSetWston() public {
        vm.startPrank(owner);
        Treasury(treasuryProxyAddress).setWston(user1);
        vm.stopPrank();
        assert(Treasury(treasuryProxyAddress).getWstonAddress() == user1);
    }

    // --------------------------- TRANSFERWSTON FUNCTION ----------------------------

    /**
     * @notice tests the behavior of transferWSTON function
     */
    function testTransferWston() public {
        vm.startPrank(owner);
        uint256 user1WstonBalanceBefore = IERC20(wston).balanceOf(user1);
        // transfers 10 WSTON to user1
        Treasury(treasuryProxyAddress).transferWSTON(user1, 10*1e27);
        uint256 user1WstonBalanceAfter = IERC20(wston).balanceOf(user1);
        vm.stopPrank();

        assert(user1WstonBalanceAfter == user1WstonBalanceBefore + 10*1e27);
    }

    /**
     * @notice tests the behavior of transferWSTON function should revert if recipient is address 0
     */
    function testTransferWstonShouldRevertIfAddressZero() public {
        vm.startPrank(owner);
        vm.expectRevert(TreasuryStorage.InvalidAddress.selector);
        Treasury(treasuryProxyAddress).transferWSTON(address(0), 10*1e27);
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of transferWSTON function should revert if insufficient balance
     */
    function testTransferWstonShouldRevertIfInsufficientBalance() public {
        vm.startPrank(owner);
        vm.expectRevert(TreasuryStorage.UnsuffiscientWstonBalance.selector);
        Treasury(treasuryProxyAddress).transferWSTON(user1, 100000000000000000000*1e27);
        vm.stopPrank();
    }

    // --------------------------- MINTNEWASSET FUNCTION ----------------------------

    /**
     * @notice tests the behavior of createNFT function
     */
    function testCreateNFTFromTreasury() public {
        vm.startPrank(owner);
        Treasury(treasuryProxyAddress).createNFT(10*1e27,user1,"");
        uint256 balance = NFTFactory(nftfactoryProxyAddress).balanceOf(user1);
        assert(balance == 1);
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of createNFT function if the caller is not the owner
     */
    function testMintNewNFTShouldRevertIfNotOwner() public {
        vm.startPrank(user1);
        vm.expectRevert();
        Treasury(treasuryProxyAddress).createNFT(10*1e27,user1,"");
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of createNFT function if the contract is paused
     */
    function testMintNewNFTShouldRevertIfContractPaused() public {
        vm.startPrank(owner);
        Treasury(treasuryProxyAddress).pause();
        vm.stopPrank();

        vm.startPrank(owner);
        vm.expectRevert("Pausable: paused");
        Treasury(treasuryProxyAddress).createNFT(10*1e27,user1,"");
        vm.stopPrank();
    }

    /**
     * @notice tests the behavior of createNFT function if the treasury does not hold enough WSTON
     */
    function testMintNewAssetsShouldRevertNotEnoughWstonInTreasury() public {
        vm.startPrank(owner);
        vm.expectRevert(TreasuryStorage.NotEnoughWstonAvailableInTreasury.selector);
        Treasury(treasuryProxyAddress).createNFT(10000000000000000000*1e27,user1,"");
        vm.stopPrank();
    }

    // --------------------------- TRANSFERTREASURYTOKENSTO FUNCTION ----------------------------

    /**
     * @notice tests the behavior of transferTreasuryTokensTo function
     */
    function testTransferTreasuryNFTto() public {
        // mint new Asset to the treasury
        vm.startPrank(treasuryProxyAddress);
        vm.expectEmit(true, true, true, true);
        emit NFTFactoryStorage.Created(0, 10*1e27, treasuryProxyAddress, "");
        NFTFactory(nftfactoryProxyAddress).createNFT(10*1e27,treasuryProxyAddress,"");
        uint256 balance = NFTFactory(nftfactoryProxyAddress).balanceOf(treasuryProxyAddress);
        assert(balance == 1);
        vm.stopPrank();

        // transfer asset to user1
        vm.startPrank(owner);
        Treasury(treasuryProxyAddress).transferTreasuryNFTto(user1, 0);
        assert(NFTFactory(nftfactoryProxyAddress).balanceOf(treasuryProxyAddress) == 0);
        assert(NFTFactory(nftfactoryProxyAddress).balanceOf(user1) == 1);
        vm.stopPrank();
    }

}