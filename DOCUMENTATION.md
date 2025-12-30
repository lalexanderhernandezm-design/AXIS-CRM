
# Prompt Maestro | Resumen Ejecutivo

## 1. Visión del Producto
Prompt Maestro es una solución de CRM B2B diseñada para transformar datos operativos en inteligencia estratégica. No es solo un repositorio de contactos; es una herramienta de trazabilidad 360 asistida por IA para equipos de ventas que buscan optimizar sus ciclos comerciales.

## 2. Requerimientos Destacados
### Funcionales (RF)
- **Gestión 360**: CRUD completo con historial de estados y línea de tiempo de interacciones.
- **Importación Inteligente**: Wizard con mapeo de columnas y validación de duplicados.
- **Trazabilidad Multi-canal**: Registro de conversaciones vía WhatsApp, Mail, Llamadas y Visitas con adjuntos.
- **IA Analytics**: Cada gráfica del dashboard incluye un botón de "Análisis IA" que utiliza Gemini 3 para detectar anomalías y recomendar acciones.

### No Funcionales (RNF)
- **Seguridad**: Autenticación basada en roles (Admin/Comercial).
- **Rendimiento**: Carga de métricas en <3s mediante agregaciones optimizadas.
- **UX**: Interfaz minimalista orientada a reducir clics del vendedor.

## 3. Modelo de Datos
- **Contacts**: Entidad principal (Nombre, Empresa, Cargo, Email, Teléfono, Web, Origen, Estado).
- **Interactions**: Log con timestamp, canal y resumen.
- **StatusHistory**: Auditoría de cambios de fase comercial.
- **Catalogs**: Orígenes y Canales personalizables.

## 4. Estrategia de IA
- **Modelo**: Gemini-3-flash-preview.
- **Propósito**: Análisis de sentimientos en logs, detección de leads estancados y proyecciones de conversión basadas en orígenes históricos.

## 5. Roadmap Sugerido
- **MVP**: CRM Básico + Dashboard Estático + IA Analítica básica.
- **v1.1**: Gestión de catálogos editable + Filtros avanzados de exportación.
- **v1.2**: Integración nativa con WhatsApp API para trazabilidad automática.
- **v2.0**: IA Predictiva (Lead Scoring automático).
