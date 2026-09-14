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
  seguidores: number;
  estilo: string;
  whatsapp: string;
  entregas: number;
};

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  whatsapp: string;
  claveHash: string;
  roles: Rol[];
  createdAt: string;
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
  motivo: MotivoReporte;
  detalle: string;
  createdAt: string;
};
