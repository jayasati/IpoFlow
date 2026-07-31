-- AlterTable
ALTER TABLE `Application` ADD COLUMN `fundingSource` ENUM('OPERATOR', 'SELF') NOT NULL DEFAULT 'OPERATOR',
    ADD COLUMN `memberProfitOrLoss` DECIMAL(12, 2) NULL;

-- CreateTable
CREATE TABLE `OperatorTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `ipoId` INTEGER NOT NULL,
    `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OperatorTransaction_applicationId_key`(`applicationId`),
    INDEX `OperatorTransaction_memberId_idx`(`memberId`),
    INDEX `OperatorTransaction_ipoId_idx`(`ipoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OperatorTransaction` ADD CONSTRAINT `OperatorTransaction_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OperatorTransaction` ADD CONSTRAINT `OperatorTransaction_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OperatorTransaction` ADD CONSTRAINT `OperatorTransaction_ipoId_fkey` FOREIGN KEY (`ipoId`) REFERENCES `Ipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
