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

// Helper: fecha actual en UTC. La conversión a hora local se realiza en el frontend.
const localNow = () => {
  return new Date();
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Example route for incidentes
app.get('/api/incidentes', async (req, res) => {
  try {
    const incidentes = await prisma.incidente.findMany({
      orderBy: {
        fecha_creacion: 'desc'
      },
      include: {
        Alerta: true,
        EquipoSoporte: true,
        TicketIncidentes: true,
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
        fecha_hora: localNow(),
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
        fecha_creacion: localNow(),
        estado_alerta: 'ACTIVA',
        regla_itil: 'R-002 Crash Crítico Detectado',
        umbral: '> 0',
        evento_id: evento.evento_id,
      }
    });

    // 4. Crear Incidente
    const nuevoIncidente = await prisma.incidente.create({
      data: {
        codigo: `INC-${localNow().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        titulo: 'Crash de Aplicación en Tiempo Real',
        descripcion: 'El usuario experimentó un cierre inesperado al presionar "Simular Crash".',
        prioridad: 'ALTA',
        estado_incidente: localNow(),
        fecha_creacion: localNow(),
        fecha_resolucion: BigInt(0),
        alerta_id: alerta.alerta_id,
        equipo_id: equipo.equipo_id,
        sla_id: sla.sla_id,
      }
    });

    // 5. Crear Ticket de Incidente vinculado
    const nuevoTicket = await prisma.ticketIncidente.create({
      data: {
        numero: `TCK-${localNow().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        estado_ticket: 'ABIERTO',
        canal_origen: 'NOC',
        incidente_id: nuevoIncidente.incidente_id,
      }
    });

    const incidenteConTicket = await prisma.incidente.findUnique({
      where: { incidente_id: nuevoIncidente.incidente_id },
      include: {
        Alerta: true,
        EquipoSoporte: true,
        TicketIncidentes: true,
      }
    });

    res.json({ incidente: incidenteConTicket, ticket: nuevoTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error simulando crash' });
  }
});

// 5. Nuevas Rutas de Métricas y Resolución
app.get('/api/metricas/dashboard', async (req, res) => {
  try {
    // Contar incidentes por estado
    const totalIncidentes = await prisma.incidente.count();
    const incidentesAbiertos = await prisma.incidente.count({
      where: { fecha_resolucion: BigInt(0) }
    });
    const incidentesResueltos = totalIncidentes - incidentesAbiertos;

    // Calcular tiempo promedio de resolución (en minutos)
    const resueltos = await prisma.incidente.findMany({
      where: { fecha_resolucion: { not: BigInt(0) } },
      select: { fecha_creacion: true, fecha_resolucion: true }
    });

    let tiempoPromedioMin = 0;
    if (resueltos.length > 0) {
      const tiempos = resueltos.map(inc => {
        const creacion = new Date(inc.fecha_creacion).getTime();
        const resolucion = Number(inc.fecha_resolucion);
        return (resolucion - creacion) / 1000 / 60; // en minutos
      });
      tiempoPromedioMin = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
    }

    const isDegraded = incidentesAbiertos > 0;

    const now = localNow();
    const points = [35, 30, 25, 20, 15, 10, 5, 0];
    const baseEvents = [12, 15, 10, 14, 18, 11, 13, 16];
    const anomalyEvents = [12, 15, 10, 14, 18, 150, 210, 180];

    const chartData = points.map((minutesAgo, index) => {
      const timestamp = new Date(now.getTime() - minutesAgo * 60_000);
      return {
        time: timestamp.toISOString(),
        events: isDegraded ? anomalyEvents[index] : baseEvents[index]
      };
    });

    const currentEventsPerMinute = chartData[chartData.length - 1].events;

    res.json({
      isDegraded,
      chartData,
      currentEventsPerMinute,
      stats: {
        total: totalIncidentes,
        abiertos: incidentesAbiertos,
        resueltos: incidentesResueltos,
        tiempoPromedioMin: tiempoPromedioMin || 0
      }
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

app.get('/api/conocimiento', async (req, res) => {
  try {
    const registros = await prisma.registroConocimiento.findMany({
      orderBy: { fecha_creacion: 'desc' },
      include: { Incidente: true }
    });
    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo registros de conocimiento' });
  }
});

app.post('/api/incidentes/resolver', async (req, res) => {
  try {
    // Resolver todos los incidentes activos (simulación de hotfix)
    const incidentesActivos = await prisma.incidente.findMany({
      where: { fecha_resolucion: BigInt(0) }
    });

    if (incidentesActivos.length === 0) {
      return res.json({ success: true, count: 0, message: 'No hay incidentes activos para resolver.' });
    }

    const appMovil = await prisma.aplicacionMovil.findFirst();
    if (!appMovil) {
      return res.status(500).json({ error: 'No se encontró la aplicación móvil en la base de datos.' });
    }

    const deployTimestamp = BigInt(Date.now());

    const hotfix = await prisma.hotfix.create({
      data: {
        version: 'v2.1.4',
        fecha_despliegue: localNow(),
        descripcion: 'Hotfix para normalizar picos de crash y completar la resolución de incidentes.',
        estado_despliegue: 'COMPLETADO',
        app_id: appMovil.app_id,
        HotfixIncidentes: {
          create: incidentesActivos.map(inc => ({
            incidente_id: inc.incidente_id
          }))
        }
      }
    });

    await prisma.incidente.updateMany({
      where: { fecha_resolucion: BigInt(0) },
      data: { fecha_resolucion: deployTimestamp }
    });

    const registrosConocimiento = await Promise.all(
      incidentesActivos.map(inc =>
        prisma.registroConocimiento.create({
          data: {
            codigo: `KB-${hotfix.version}-${inc.incidente_id}`,
            titulo: `Resolución automática ${hotfix.version} para ${inc.titulo}`,
            solucion: `Se aplicó el hotfix ${hotfix.version} para resolver el incidente ${inc.codigo}. El parche normalizó la latencia y estabilizó el sistema de monitoreo. Se actualizó el estado a resuelto y se registró la acción en el historial del equipo.`, 
            fecha_creacion: localNow(),
            incidente_id: inc.incidente_id
          }
        })
      )
    );

    res.json({
      success: true,
      count: incidentesActivos.length,
      hotfixId: hotfix.hotfix_id.toString(),
      version: hotfix.version,
      knowledgeRecords: registrosConocimiento.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error resolviendo incidentes' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const validUsername = 'admin';
    const validPassword = 'agro1234';

    if (username === validUsername && password === validPassword) {
      return res.json({ user: { username: 'admin', name: 'Operador Monitoreo Operativo Móvil' } });
    }

    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error procesando el login' });
  }
});

app.delete('/api/incidentes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID de incidente requerido' });
    }

    const incidenteId = BigInt(id);
    const incidente = await prisma.incidente.findUnique({
      where: { incidente_id: incidenteId }
    });

    if (!incidente) {
      return res.status(404).json({ error: 'Incidente no encontrado' });
    }

    await prisma.$transaction([
      prisma.ticketIncidente.deleteMany({ where: { incidente_id: incidenteId } }),
      prisma.metricaUX.deleteMany({ where: { incidente_id: incidenteId } }),
      prisma.hotfixIncidente.deleteMany({ where: { incidente_id: incidenteId } }),
      prisma.registroConocimiento.deleteMany({ where: { incidente_id: incidenteId } }),
      prisma.notificacionWebhook.deleteMany({ where: { incidente_id: incidenteId } }),
      prisma.incidente.delete({ where: { incidente_id: incidenteId } })
    ]);

    res.json({ success: true, id: incidenteId.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando incidente' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
