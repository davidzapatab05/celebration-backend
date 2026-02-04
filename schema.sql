-- ============================================
-- Esquema de Base de Datos: bd-celebration
-- ============================================
-- Este archivo documenta el esquema completo de la base de datos
-- Las tablas se crean automáticamente por TypeORM con synchronize: true

-- ============================================
-- Tabla: user
-- ============================================
-- Almacena información de usuarios del sistema
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `avatar` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'inactive',
  `maxRequests` int DEFAULT 3,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: celebration_request
-- ============================================
-- Almacena las solicitudes de celebración de los usuarios
CREATE TABLE IF NOT EXISTS `celebration_request` (
  `id` varchar(36) NOT NULL,
  `partnerName` varchar(255) NOT NULL,
  `message` text,
  `slug` varchar(255) NOT NULL,
  `response` varchar(255) NOT NULL DEFAULT 'pending',
  `affectionLevel` varchar(255) NOT NULL DEFAULT 'te_quiero',
  `imagePath` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_slug` (`slug`),
  KEY `FK_user` (`userId`),
  CONSTRAINT `FK_celebration_request_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: occasion
-- ============================================
-- Almacena los tipos de ocasiones especiales disponibles
CREATE TABLE IF NOT EXISTS `occasion` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `primaryColor` varchar(20) NOT NULL,
  `secondaryColor` varchar(20) DEFAULT NULL,
  `description` text,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: celebration_request
-- ============================================
-- Almacena las solicitudes de celebración de los usuarios
CREATE TABLE IF NOT EXISTS `celebration_request` (
  `id` varchar(36) NOT NULL,
  `partnerName` varchar(255) NOT NULL,
  `message` text,
  `slug` varchar(255) NOT NULL,
  `response` varchar(255) NOT NULL DEFAULT 'pending',
  `affectionLevel` varchar(255) NOT NULL DEFAULT 'te_amo',
  `imagePath` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` varchar(36) DEFAULT NULL,
  `occasionId` varchar(36) DEFAULT NULL,
  `extraData` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_slug` (`slug`),
  KEY `FK_user` (`userId`),
  KEY `FK_occasion` (`occasionId`),
  CONSTRAINT `FK_celebration_request_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_celebration_request_occasion` FOREIGN KEY (`occasionId`) REFERENCES `occasion` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Índices adicionales para optimización
-- ============================================
CREATE INDEX `IDX_user_status` ON `user` (`status`);
CREATE INDEX `IDX_user_role` ON `user` (`role`);
CREATE INDEX `IDX_celebration_request_response` ON `celebration_request` (`response`);
CREATE INDEX `IDX_celebration_request_createdAt` ON `celebration_request` (`createdAt`);
CREATE INDEX `IDX_occasion_isActive` ON `occasion` (`isActive`);
CREATE INDEX `IDX_occasion_sortOrder` ON `occasion` (`sortOrder`);

-- ============================================
-- Notas sobre el esquema:
-- ============================================
-- 1. user.id y celebration_request.id son UUIDs generados automáticamente
-- 2. user.role puede ser: 'user', 'admin', etc.
-- 3. user.status puede ser: 'active', 'inactive'
-- 4. celebration_request.response puede ser: 'pending', 'accepted', 'rejected'
-- 5. celebration_request.affectionLevel puede ser: 'te_amo', 'te_quiero'
-- 6. celebration_request.slug es único y se usa para URLs amigables
-- 7. Las relaciones se manejan con ON DELETE CASCADE para mantener integridad referencial
