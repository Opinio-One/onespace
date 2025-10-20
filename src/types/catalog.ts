// Catalog types and interfaces for server-client communication

export interface FilterMetadata {
  type: "select" | "multiselect" | "range";
  options?: (string | number)[];
  optionsWithCounts?: Array<{ value: string | number; count: number }>;
  min?: number;
  max?: number;
  step?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filterOptions?: Record<string, (string | number)[]>;
  filterMetadata?: Record<string, FilterMetadata>;
}

export interface CatalogFilters {
  [key: string]: string | number | string[] | undefined;
}

export interface CatalogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: CatalogFilters;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Catalog Item Types

// Zonnepanelen type
export interface Zonnepaneel {
  Id: number;
  Product: string;
  Afbeelding: string;
  "Product code": string;
  Merk: string;
  Logo: string;
  "Vermogen (Wp)": number;
  "Lengte (mm)": number;
  "Breedte (mm)": number;
  "Hoogte (mm)": number;
  "Gewicht (kg)": string;
  "Celtechnologie type": string;
  "Bi-Facial": string;
  "Glas type": string;
  "Glas-glas": string;
  "Cell type": string;
  Celmateriaal: string;
  "Productgarantie (jaren)": number;
  NMOT: string;
  "NMOT factor 1.15": string;
  "Verkoopprijs paneel": string;
  "Prijs online gemiddeld": string;
  "Jaaropbrengst (kWh)": string;
  "Totale opbrengst na 10 jaar": string;
  "Totale opbrengst na 20 jaar": string;
  "Totale opbrengst na 30 jaar": string;
  "Opbrengst (in garantietermijn)": string;
  "OS (opbrengstscore)": string;
  "DS (duurzaamheidscore)": string;
  "LCOE score 10 jaar": string;
  "LCOE score 20 jaar": string;
  "LCOE score 30 jaar": string;
  Datasheet: string;
}

// Thuisbatterijen type
export interface Thuisbatterij {
  Id: number;
  Product: string;
  Afbeelding: string;
  "Product code": string;
  "Soort batterij": string;
  "Aantal fases": string;
  Merk: string;
  Logo: string;
  "Vermogen categorie": string;
  Categorie: string;
  Samenstelling: string;
  "Batterij Capaciteit (kWh)": string;
  "Batterij Voltage (Vdc/Vac)": string;
  "Batterij Capaciteit (Ah)": string;
  "Ontladingsvermogen (kW)": string;
  "Ontladingsstroom (A)": string;
  "Vermogen per kWh": number;
  "Volledig opgeladen nominale draaitijd": number;
  "Breedte (mm)": number;
  "Diepte (mm)": number;
  "Hoogte (mm)": number;
  Gewicht: string;
  "Ontladingsdiepte (%)": string;
  "Cyclus levensduur bij 25℃": number;
  "Design levensduur": string;
  "Levensduur intensief gebruik": number;
  Prijs: string;
  Datasheet: string[];
  "Compatibility list": string;
}

// Omvormers type
export interface Omvormer {
  Id: number;
  Name: string;
  Afbeelding: string;
  Logo: string;
  Merk: string;
  "Type omvormer": string;
  Vermogen: number;
  "Aantal fases": string;
  MPPTs: number;
  "Strings per MPPT": number;
  "PV WP": string;
  Strings: number;
  Price: string;
  Cost: string;
  Currency: string;
  "Garantie (jaren)": number;
  SKU: string;
  Datasheet: any;
}

// Binnenunits type
export interface Binnenunit {
  id: number;
  Product: string;
  "Logo:": string;
  "Foto unit:": string;
  "Kleur:": string;
  "Kleur voorbeeld:": string;
  "Merk:": string;
  "Serie:": string;
  "Type:": string;
  "Modelvariant:": string;
  prijs: string;
  "Vermogen categorie": string;
  "geluidsdruk (dB)": string;
  SEER: string;
  SCOP: string;
  "Energielabel Koelen:": string;
  "Energielabel Verwarmen": string;
  "Multisplit compatibel": string;
  "Smart-Functies": string;
  "Filters:": string;
  "Datasheet/Brochure": any;
  "Airconditioning Buitenunit": string;
  "Vermogen (kW):": number;
}

// Buitenunits type
export interface Buitenunit {
  Id: number;
  Name: string;
  "Logo:": string;
  "Foto buitenunit:": string;
  "Merk:": string;
  "Serie:": string;
  "Single/Multi-Split": string;
  "Modelvariant:": string;
  prijs: string;
  "Vermogen (kW)": string;
  "Vermogen categorie": string;
  "Aantal poorten Min-Max:": string;
  "Electrische aansluiting:": string;
  "COP Cooling/Heating": string;
  SEER: string;
  SCOP: string;
  "Gewicht: (kg)": string;
  "Air flow (m3/Min):": string;
  "Geluidsdruk (dB)": number;
  "Afmeting (H/B/D):": string;
  "Maximum som binnenunit": string;
  "Airconditioning binnenunit": string;
  "Modelvariant: (from Airconditioning binnenunit)": string;
  "Energielabel koelen:": string;
  "Datasheet:": any;
}

// Configuration for filterable fields per table
export interface FilterFieldConfig {
  field: string;
  label: string;
  type: "select" | "multiselect" | "range";
}

export interface TableConfig {
  name: string;
  searchableFields: string[];
  filterFields: FilterFieldConfig[];
}
