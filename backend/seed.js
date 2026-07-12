import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeder...');

  // 1. Crear Usuario
  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Admin Prueba',
      email: 'admin@monitoreo.com',
      rol: 'Administrador',
    },
  });

  // 2. Crear Región
  const region = await prisma.region.create({
    data: {
      nombre: 'América del Sur',
      pais: 'Perú',
      ciudad: 'Lima',
      lat_lon: -12.0464,
    },
  });

  // 3. Crear Dispositivo
  const dispositivo = await prisma.dispositivo.create({
    data: {
      modelo: 'iPhone 14 Pro',
      so_version: 'iOS 17',
      nivel_bateria: 85,
      usuario_id: usuario.usuario_id,
      region_id: region.region_id,
    },
  });

  // 4. Crear Aplicación Móvil
  const appMovil = await prisma.aplicacionMovil.create({
    data: {
      nombre: 'E-Commerce App',
      paquete: 'com.ecommerce.app',
      version: '1.2.0',
    },
  });

  // 5. Crear SDK de Monitoreo
  const sdk = await prisma.sdkMonitoreo.create({
    data: {
      nombre: 'MonitoreoSDK Core',
      version: '2.1.0',
      proveedor: 'Tech Solutions',
    },
  });

  // 6. Crear Eventos de Monitoreo
  console.log('Creando eventos...');
  for (let i = 0; i < 5; i++) {
    await prisma.eventoMonitoreo.create({
      data: {
        fecha_hora: new Date(Date.now() - i * 3600000), // Hace i horas
        tipo_evento: i % 2 === 0 ? 'ALTA_LATENCIA' : 'CRASH',
        severidad: i % 2 === 0 ? 'ADVERTENCIA' : 'CRITICO',
        estado_evento: 'REGISTRADO',
        dispositivo_id: dispositivo.dispositivo_id,
        app_id: appMovil.app_id,
        sdk_id: sdk.sdk_id,
        region_id: region.region_id,
      },
    });
  }

  // 7. Crear Equipo Soporte, SLA, y Alerta
  const equipo = await prisma.equipoSoporte.create({
    data: {
      nombre: 'Equipo de Operaciones IT',
      tipo_equipo: 'L2',
      canal_contacto: '#ops-alertas',
    },
  });

  const sla = await prisma.sla.create({
    data: {
      nombre: 'SLA Crítico 99.9%',
      objetivo_disponibilidad: 99.9,
      max_tiempo_respuesta: 2.0,
      severidad: 'ALTA',
    },
  });

  const eventoError = await prisma.eventoMonitoreo.findFirst();

  const alerta = await prisma.alerta.create({
    data: {
      fecha_creacion: new Date(),
      estado_alerta: 'ACTIVA',
      regla_itil: 'R-001 Caída de Sistema',
      umbral: '> 500ms',
      evento_id: eventoError.evento_id,
    },
  });

  // 8. Crear Incidente
  await prisma.incidente.create({
    data: {
      codigo: 'INC-2026-001',
      titulo: 'Latencia excesiva en checkout',
      descripcion: 'Los usuarios reportan lentitud al intentar pagar.',
      prioridad: 'ALTA',
      estado_incidente: new Date(),
      fecha_creacion: new Date(),
      fecha_resolucion: BigInt(0),
      alerta_id: alerta.alerta_id,
      equipo_id: equipo.equipo_id,
      sla_id: sla.sla_id,
    },
  });

  console.log('¡Seeder ejecutado correctamente! Datos de prueba creados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
