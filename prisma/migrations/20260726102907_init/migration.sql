-- CreateTable
CREATE TABLE `Member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `defaultCommissionRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company` VARCHAR(191) NOT NULL,
    `issuePrice` DECIMAL(12, 2) NOT NULL,
    `lotSize` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'OPEN', 'APPLIED', 'ALLOTTED', 'SOLD', 'SETTLED', 'COMPLETE') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipoId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `lots` INTEGER NOT NULL,
    `shares` INTEGER NOT NULL DEFAULT 0,
    `commissionRate` DECIMAL(5, 2) NULL,
    `status` ENUM('APPLIED', 'ALLOTTED', 'NOT_ALLOTTED', 'PARTIALLY_SOLD', 'SOLD', 'SETTLED') NOT NULL DEFAULT 'APPLIED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Application_ipoId_memberId_key`(`ipoId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sale` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `applicationId` INTEGER NOT NULL,
    `shares` INTEGER NOT NULL,
    `sellPrice` DECIMAL(12, 2) NOT NULL,
    `soldAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Sale_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ledger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `ipoId` INTEGER NULL,
    `saleId` INTEGER NULL,
    `type` ENUM('MONEY_SENT', 'MONEY_RETURNED', 'PROFIT', 'LOSS', 'COMMISSION', 'ADJUSTMENT') NOT NULL,
    `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Ledger_memberId_idx`(`memberId`),
    INDEX `Ledger_ipoId_idx`(`ipoId`),
    INDEX `Ledger_saleId_idx`(`saleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParticipantGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParticipantGroupMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `groupId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,

    UNIQUE INDEX `ParticipantGroupMember_groupId_memberId_key`(`groupId`, `memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_ipoId_fkey` FOREIGN KEY (`ipoId`) REFERENCES `Ipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_ipoId_fkey` FOREIGN KEY (`ipoId`) REFERENCES `Ipo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParticipantGroupMember` ADD CONSTRAINT `ParticipantGroupMember_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `ParticipantGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParticipantGroupMember` ADD CONSTRAINT `ParticipantGroupMember_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
