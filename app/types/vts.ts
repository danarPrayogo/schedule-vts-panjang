export interface ParsedCoordinates {
  lat: number;
  lng: number;
  rawLat: string;
  rawLng: string;
  latFormatted: string;
  lngFormatted: string;
}

export interface VTSMetadata {
  sektor: string;
  operatorVts: string;
  vtso: string;
  waktu: string;
  tanggal: string;
  shift: string;
  tahun: string;
  supervisor: string;
  nip: string;
}

export interface VesselRecord {
  no: string;
  waktu: string;
  namaKapal: string;
  mmsi: string;
  asal: string;
  tujuan: string;
  eta: string;
  waktuSandarLabuh: string;
  posisiLabuh: string;
  loa: string;
  gt: string;
  draft: string;
  muatan: string;
  agen: string;
  keterangan: string;
}

export interface ParsedVTSResult {
  metadata: VTSMetadata;
  vessels: VesselRecord[];
}
