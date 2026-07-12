-- CreateTable
CREATE TABLE `Usuario` (
    `usuario_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `rol` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispositivo` (
    `dispositivo_id` BIGINT NOT NULL AUTO_INCREMENT,
    `modelo` VARCHAR(120) NOT NULL,
    `so_version` VARCHAR(40) NOT NULL,
    `nivel_bateria` TINYINT NOT NULL,
    `usuario_id` BIGINT NOT NULL,
    `region_id` BIGINT NOT NULL,

    PRIMARY KEY (`dispositivo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Region` (
    `region_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `pais` VARCHAR(80) NOT NULL,
    `ciudad` VARCHAR(120) NOT NULL,
    `lat_lon` DECIMAL(9, 6) NOT NULL,

    PRIMARY KEY (`region_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AplicacionMovil` (
    `app_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `paquete` VARCHAR(80) NOT NULL,
    `version` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`app_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SdkMonitoreo` (
    `sdk_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `proveedor` VARCHAR(120) NOT NULL,

    PRIMARY KEY (`sdk_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoMonitoreo` (
    `evento_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_hora` DATETIME NOT NULL,
    `tipo_evento` VARCHAR(191) NOT NULL,
    `severidad` VARCHAR(191) NOT NULL,
    `estado_evento` VARCHAR(191) NOT NULL,
    `dispositivo_id` BIGINT NOT NULL,
    `app_id` BIGINT NOT NULL,
    `sdk_id` BIGINT NOT NULL,
    `region_id` BIGINT NOT NULL,

    PRIMARY KEY (`evento_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Excepcion` (
    `excepcion_id` BIGINT NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(60) NOT NULL,
    `mensaje` VARCHAR(255) NOT NULL,
    `stack_trace` TEXT NOT NULL,
    `evento_id` INTEGER NOT NULL,

    PRIMARY KEY (`excepcion_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alerta` (
    `alerta_id` BIGINT NOT NULL AUTO_INCREMENT,
    `fecha_creacion` DATETIME NOT NULL,
    `estado_alerta` VARCHAR(20) NOT NULL,
    `regla_itil` VARCHAR(100) NOT NULL,
    `umbral` VARCHAR(20) NOT NULL,
    `evento_id` INTEGER NOT NULL,

    PRIMARY KEY (`alerta_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incidente` (
    `incidente_id` BIGINT NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(36) NOT NULL,
    `titulo` VARCHAR(120) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `prioridad` VARCHAR(20) NOT NULL,
    `estado_incidente` DATETIME NOT NULL,
    `fecha_creacion` DATETIME NOT NULL,
    `fecha_resolucion` BIGINT NOT NULL,
    `alerta_id` BIGINT NOT NULL,
    `equipo_id` BIGINT NOT NULL,
    `sla_id` BIGINT NOT NULL,

    PRIMARY KEY (`incidente_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketIncidente` (
    `ticket_id` BIGINT NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(36) NOT NULL,
    `estado_ticket` VARCHAR(20) NOT NULL,
    `canal_origen` VARCHAR(30) NOT NULL,
    `incidente_id` BIGINT NOT NULL,

    PRIMARY KEY (`ticket_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipoSoporte` (
    `equipo_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `tipo_equipo` VARCHAR(30) NOT NULL,
    `canal_contacto` VARCHAR(120) NOT NULL,

    PRIMARY KEY (`equipo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricaUX` (
    `metrica_id` BIGINT NOT NULL AUTO_INCREMENT,
    `timestamp` DATETIME NOT NULL,
    `tiempo_respuesta_prom` DECIMAL(10, 2) NOT NULL,
    `tasa_exito_transacciones` DECIMAL(5, 2) NOT NULL,
    `disponibilidad_servicio` DECIMAL(5, 2) NOT NULL,
    `app_id` BIGINT NOT NULL,
    `incidente_id` BIGINT NULL,

    PRIMARY KEY (`metrica_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sla` (
    `sla_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `objetivo_disponibilidad` DECIMAL(5, 2) NOT NULL,
    `max_tiempo_respuesta` DOUBLE NOT NULL,
    `severidad` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`sla_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hotfix` (
    `hotfix_id` BIGINT NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(20) NOT NULL,
    `fecha_despliegue` DATETIME NOT NULL,
    `descripcion` TEXT NOT NULL,
    `estado_despliegue` VARCHAR(20) NOT NULL,
    `app_id` BIGINT NOT NULL,

    PRIMARY KEY (`hotfix_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotfixEvento` (
    `hotfix_evento_id` BIGINT NOT NULL AUTO_INCREMENT,
    `hotfix_id` BIGINT NOT NULL,
    `evento_id` INTEGER NOT NULL,

    PRIMARY KEY (`hotfix_evento_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HotfixIncidente` (
    `hotfix_incidente_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotfix_id` BIGINT NOT NULL,
    `incidente_id` BIGINT NOT NULL,

    PRIMARY KEY (`hotfix_incidente_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistroConocimiento` (
    `registro_id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `solucion` TEXT NOT NULL,
    `fecha_creacion` DATETIME NOT NULL,
    `incidente_id` BIGINT NOT NULL,

    PRIMARY KEY (`registro_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificacionWebhook` (
    `webhook_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_envio` DATETIME NOT NULL,
    `destino` VARCHAR(191) NOT NULL,
    `estado_entrega` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `alerta_id` BIGINT NULL,
    `incidente_id` BIGINT NULL,

    PRIMARY KEY (`webhook_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dispositivo` ADD CONSTRAINT `Dispositivo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`usuario_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispositivo` ADD CONSTRAINT `Dispositivo_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `Region`(`region_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoMonitoreo` ADD CONSTRAINT `EventoMonitoreo_dispositivo_id_fkey` FOREIGN KEY (`dispositivo_id`) REFERENCES `Dispositivo`(`dispositivo_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoMonitoreo` ADD CONSTRAINT `EventoMonitoreo_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `AplicacionMovil`(`app_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoMonitoreo` ADD CONSTRAINT `EventoMonitoreo_sdk_id_fkey` FOREIGN KEY (`sdk_id`) REFERENCES `SdkMonitoreo`(`sdk_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoMonitoreo` ADD CONSTRAINT `EventoMonitoreo_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `Region`(`region_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Excepcion` ADD CONSTRAINT `Excepcion_evento_id_fkey` FOREIGN KEY (`evento_id`) REFERENCES `EventoMonitoreo`(`evento_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alerta` ADD CONSTRAINT `Alerta_evento_id_fkey` FOREIGN KEY (`evento_id`) REFERENCES `EventoMonitoreo`(`evento_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidente` ADD CONSTRAINT `Incidente_alerta_id_fkey` FOREIGN KEY (`alerta_id`) REFERENCES `Alerta`(`alerta_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidente` ADD CONSTRAINT `Incidente_equipo_id_fkey` FOREIGN KEY (`equipo_id`) REFERENCES `EquipoSoporte`(`equipo_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidente` ADD CONSTRAINT `Incidente_sla_id_fkey` FOREIGN KEY (`sla_id`) REFERENCES `Sla`(`sla_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketIncidente` ADD CONSTRAINT `TicketIncidente_incidente_id_fkey` FOREIGN KEY (`incidente_id`) REFERENCES `Incidente`(`incidente_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricaUX` ADD CONSTRAINT `MetricaUX_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `AplicacionMovil`(`app_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricaUX` ADD CONSTRAINT `MetricaUX_incidente_id_fkey` FOREIGN KEY (`incidente_id`) REFERENCES `Incidente`(`incidente_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Hotfix` ADD CONSTRAINT `Hotfix_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `AplicacionMovil`(`app_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HotfixEvento` ADD CONSTRAINT `HotfixEvento_hotfix_id_fkey` FOREIGN KEY (`hotfix_id`) REFERENCES `Hotfix`(`hotfix_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HotfixEvento` ADD CONSTRAINT `HotfixEvento_evento_id_fkey` FOREIGN KEY (`evento_id`) REFERENCES `EventoMonitoreo`(`evento_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HotfixIncidente` ADD CONSTRAINT `HotfixIncidente_hotfix_id_fkey` FOREIGN KEY (`hotfix_id`) REFERENCES `Hotfix`(`hotfix_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HotfixIncidente` ADD CONSTRAINT `HotfixIncidente_incidente_id_fkey` FOREIGN KEY (`incidente_id`) REFERENCES `Incidente`(`incidente_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistroConocimiento` ADD CONSTRAINT `RegistroConocimiento_incidente_id_fkey` FOREIGN KEY (`incidente_id`) REFERENCES `Incidente`(`incidente_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionWebhook` ADD CONSTRAINT `NotificacionWebhook_alerta_id_fkey` FOREIGN KEY (`alerta_id`) REFERENCES `Alerta`(`alerta_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionWebhook` ADD CONSTRAINT `NotificacionWebhook_incidente_id_fkey` FOREIGN KEY (`incidente_id`) REFERENCES `Incidente`(`incidente_id`) ON DELETE SET NULL ON UPDATE CASCADE;
