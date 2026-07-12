import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Fix BigInt serialization for JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Example route for incidentes
app.get('/api/incidentes', async (req, res) => {
  try {
    const incidentes = await prisma.incidente.findMany({
      include: {
        Alerta: true,
        EquipoSoporte: true,
      }
    });
    res.json(incidentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener incidentes' });
  }
});

// Endpoint para simular un crash y crear el incidente en la DB
app.post('/api/simular-crash', async (req, res) => {
  try {
    // 1. Obtener o crear registros base (Dispositivo, App, etc.)
    // Asumimos que existen por el seeder, usamos findFirst
    const appMovil = await prisma.aplicacionMovil.findFirst();
    const dispositivo = await prisma.dispositivo.findFirst();
    const sdk = await prisma.sdkMonitoreo.findFirst();
    const region = await prisma.region.findFirst();
    const equipo = await prisma.equipoSoporte.findFirst();
    const sla = await prisma.sla.findFirst();

    if (!appMovil || !dispositivo || !equipo) {
      return res.status(400).json({ error: 'Faltan datos base. Corre el seeder primero.' });
    }

    // 2. Crear Evento de Monitoreo (El Crash)
    const evento = await prisma.eventoMonitoreo.create({
      data: {
        fecha_hora: new Date(),
        tipo_evento: 'CRASH',
        severidad: 'CRITICO',
        estado_evento: 'REGISTRADO',
        dispositivo_id: dispositivo.dispositivo_id,
        app_id: appMovil.app_id,
        sdk_id: sdk.sdk_id,
        region_id: region.region_id,
      }
    });

    // 3. Crear Alerta
    const alerta = await prisma.alerta.create({
      data: {
        fecha_creacion: new Date(),
        estado_alerta: 'ACTIVA',
        regla_itil: 'R-002 Crash Crítico Detectado',
        umbral: '> 0',
        evento_id: evento.evento_id,
      }
    });

    // 4. Crear Incidente
    const nuevoIncidente = await prisma.incidente.create({
      data: {
        codigo: `INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        titulo: 'Crash de Aplicación en Tiempo Real',
        descripcion: 'El usuario experimentó un cierre inesperado al presionar "Simular Crash".',
        prioridad: 'ALTA',
        estado_incidente: new Date(),
        fecha_creacion: new Date(),
        fecha_resolucion: BigInt(0),
        alerta_id: alerta.alerta_id,
        equipo_id: equipo.equipo_id,
        sla_id: sla.sla_id,
      },
      include: {
        Alerta: true,
        EquipoSoporte: true,
      }
    });

    res.json(nuevoIncidente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error simulando crash' });
  }
});

// 5. Nuevas Rutas de Métricas y Resolución
app.get('/api/metricas/dashboard', async (req, res) => {
  try {
    // Buscar incidentes no resueltos para ver si el sistema está degradado
    const incidentesActivos = await prisma.incidente.count({
      where: { estado_incidente: { not: new Date(0) }, fecha_resolucion: BigInt(0) } // BigInt(0) means unresolved in our logic
    });

    const isDegraded = incidentesActivos > 0;

    // Generar datos base dinámicos (simulando un time-series real)
    const baseData = [
      { time: '10:00', events: 12 },
      { time: '10:05', events: 15 },
      { time: '10:10', events: 10 },
      { time: '10:15', events: 14 },
      { time: '10:20', events: 18 },
    ];

    if (isDegraded) {
      baseData.push(
        { time: '10:25', events: 150 },
        { time: '10:30', events: 210 },
        { time: '10:35', events: 180 }
      );
    } else {
      baseData.push(
        { time: '10:25', events: 11 },
        { time: '10:30', events: 13 },
        { time: '10:35', events: 16 }
      );
    }

    res.json({
      isDegraded,
      chartData: baseData,
      currentEventsPerMinute: isDegraded ? 210 : 14
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo dashboard data' });
  }
});

app.get('/api/metricas/ux', async (req, res) => {
  try {
    const incidentesActivos = await prisma.incidente.count({
      where: { fecha_resolucion: BigInt(0) }
    });

    const isDegraded = incidentesActivos > 0;

    res.json({
      apdex: isDegraded ? 0.65 : 0.94,
      crashFree: isDegraded ? 92.4 : 99.8,
      latency: isDegraded ? 2850 : 240
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo ux data' });
  }
});

app.post('/api/incidentes/resolver', async (req, res) => {
  try {
    // Resolver todos los incidentes activos (simulación de hotfix)
    const incidentesActivos = await prisma.incidente.findMany({
      where: { fecha_resolucion: BigInt(0) }
    });

    for (const inc of incidentesActivos) {
      await prisma.incidente.update({
        where: { incidente_id: inc.incidente_id },
        data: {
          fecha_resolucion: BigInt(Date.now()) // Marcamos como resuelto con el timestamp actual
        }
      });
    }

    res.json({ success: true, count: incidentesActivos.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error resolviendo incidentes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
