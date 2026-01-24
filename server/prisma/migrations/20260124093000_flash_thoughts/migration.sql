CREATE TABLE `FlashThought` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FlashThought_userId_idx`(`userId`),
    INDEX `FlashThought_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FlashThoughtImage` (
    `id` VARCHAR(191) NOT NULL,
    `thoughtId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `FlashThoughtImage_thoughtId_idx`(`thoughtId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FlashThoughtLike` (
    `id` VARCHAR(191) NOT NULL,
    `thoughtId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FlashThoughtLike_thoughtId_userId_key`(`thoughtId`, `userId`),
    INDEX `FlashThoughtLike_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FlashThoughtComment` (
    `id` VARCHAR(191) NOT NULL,
    `thoughtId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FlashThoughtComment_thoughtId_idx`(`thoughtId`),
    INDEX `FlashThoughtComment_userId_idx`(`userId`),
    INDEX `FlashThoughtComment_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `FlashThought` ADD CONSTRAINT `FlashThought_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FlashThoughtImage` ADD CONSTRAINT `FlashThoughtImage_thoughtId_fkey` FOREIGN KEY (`thoughtId`) REFERENCES `FlashThought`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FlashThoughtLike` ADD CONSTRAINT `FlashThoughtLike_thoughtId_fkey` FOREIGN KEY (`thoughtId`) REFERENCES `FlashThought`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FlashThoughtLike` ADD CONSTRAINT `FlashThoughtLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FlashThoughtComment` ADD CONSTRAINT `FlashThoughtComment_thoughtId_fkey` FOREIGN KEY (`thoughtId`) REFERENCES `FlashThought`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FlashThoughtComment` ADD CONSTRAINT `FlashThoughtComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `FlashThoughtComment` ADD CONSTRAINT `FlashThoughtComment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `FlashThoughtComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
