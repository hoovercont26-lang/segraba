export const NICHOS = [
  "Foodie",
  "Belleza",
  "Moda",
  "Fitness",
  "Maternidad",
  "Travel",
  "Tecnología",
] as const;

export const CIUDADES = [
  "Lima",
  "Arequipa",
  "Trujillo",
  "Cusco",
  "Piura",
] as const;

export type Nicho = (typeof NICHOS)[number];
export type Ciudad = (typeof CIUDADES)[number];
export type Rol = "marca" | "creador";

export const REDES = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
] as const;

export type Red = (typeof REDES)[number]["id"];

export function redesDe(item: { redes?: Red[] }): Red[] {
  return item.redes && item.redes.length > 0 ? item.redes : ["tiktok"];
}

export type EstadoAviso = "esperando-pago" | "validando" | "publicado";
export type MetodoPago = "yape" | "plin";

export type PagoPublicacion = {
  monto: number;
  metodo?: MetodoPago;
  constancia?: string;
  enviadoAt?: string;
  validadoAt?: string;
};

export type Encargo = {
  id: string;
  autorId?: string;
  marca: string;
  whatsapp: string;
  nicho: Nicho;
  ciudad: Ciudad;
  videos: number;
  precio: number;
  plazo: "esta-semana" | "diez-dias";
  brief: string;
  createdAt: string;
  elegidoPostulacionId?: string;
  redes?: Red[];
  estado?: EstadoAviso;
  pago?: PagoPublicacion;
};

export type DestinoNoti = "negocio" | "creador";

export type Notificacion = {
  id: string;
  userId: string;
  para: DestinoNoti;
  titulo: string;
  cuerpo: string;
  href: string;
  leida: boolean;
  createdAt: string;
};

export type EstadoPostulacion = "pendiente" | "elegido" | "no-elegido";

export type Postulacion = {
  id: string;
  pegaId: string;
  creadorId: string;
  autorId: string;
  nota: string;
  createdAt: string;
  estado: EstadoPostulacion;
};

export type Mensaje = {
  id: string;
  chatId: string;
  deId: string;
  texto: string;
  createdAt: string;
};

export type Creador = {
  id: string;
  autorId?: string;
  nombre: string;
  tiktok: string;
  ciudad: Ciudad;
  nichos: Nicho[];
  minPrecio: number;
  redes?: Red[];
  seguidores: number;
  estilo: string;
  whatsapp: string;
  entregas: number;
};

export type EstadoPlan =
  | "ninguno"
  | "esperando-pago"
  | "validando"
  | "activo"
  | "vencido";

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  whatsapp: string;
  claveHash: string;
  roles: Rol[];
  createdAt: string;
  /** Plan de creador: base | pro */
  plan?: "base" | "pro" | null;
  planHasta?: string | null;
  planEstado?: EstadoPlan;
  planPago?: PagoPublicacion | null;
  /** Cuántas veces se apuntó en el periodo de suscripción actual */
  postulacionesUsadas?: number;
  /** Clave del periodo (= planHasta del ciclo activo) */
  postulacionesPeriodo?: string | null;
};

export const MOTIVOS_REPORTE = [
  { id: "no-pago", label: "No pagó lo acordado" },
  { id: "no-entrego", label: "No entregó el video" },
  { id: "perfil-falso", label: "Perfil o local falso" },
  { id: "acoso", label: "Acoso o trato abusivo" },
  { id: "otro", label: "Otra cosa" },
] as const;

export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number]["id"];

export type Reporte = {
  id: string;
  deId: string;
  contraTipo: "pega" | "creador";
  contraId: string;
  contraNombre?: string;
  contacto?: string;
  motivo: MotivoReporte;
  detalle: string;
  createdAt: string;
};
