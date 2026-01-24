DROP TABLE IF EXISTS `CollabUpdate`;

DROP TABLE IF EXISTS `CollabSnapshot`;

DROP TABLE IF EXISTS `RoomMember`;

DROP TABLE IF EXISTS `RoomInvite`;

DROP TABLE IF EXISTS `Room`;

SET @drop_collab_column_stmt = (
  SELECT
    IF(
      EXISTS(
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'Document'
          AND COLUMN_NAME = 'isCollabEnabled'
      ),
      'ALTER TABLE `Document` DROP COLUMN `isCollabEnabled`',
      'SELECT 1'
    )
);
PREPARE drop_collab_column_stmt FROM @drop_collab_column_stmt;
EXECUTE drop_collab_column_stmt;
DEALLOCATE PREPARE drop_collab_column_stmt;
