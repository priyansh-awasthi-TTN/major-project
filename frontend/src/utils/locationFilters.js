function normalizeLocationValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeQuery(value) {
  return normalizeLocationValue(value).toLowerCase();
}

export function splitLocation(location) {
  const raw = normalizeLocationValue(location);

  if (!raw) {
    return { raw: '', country: '', region: '' };
  }

  if (raw.toLowerCase() === 'remote') {
    return { raw, country: 'Remote', region: '' };
  }

  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);

  if (parts.length === 1) {
    return { raw, country: parts[0], region: '' };
  }

  return {
    raw,
    country: parts[parts.length - 1],
    region: parts.slice(0, -1).join(', '),
  };
}

function sortLocations(values) {
  return [...values].sort((left, right) => {
    if (left === 'Remote') return 1;
    if (right === 'Remote') return -1;
    return left.localeCompare(right);
  });
}

export function buildLocationFilterOptions(locations = []) {
  const countries = new Set();
  const regionsByCountry = new Map();

  locations.forEach((location) => {
    const parsed = splitLocation(location);
    if (!parsed.country) return;

    countries.add(parsed.country);

    if (!regionsByCountry.has(parsed.country)) {
      regionsByCountry.set(parsed.country, new Set());
    }

    if (parsed.region) {
      regionsByCountry.get(parsed.country).add(parsed.region);
    }
  });

  return {
    countries: sortLocations(countries),
    regionsByCountry: Object.fromEntries(
      [...regionsByCountry.entries()].map(([country, regions]) => [country, sortLocations(regions)]),
    ),
  };
}

export function getRegionsForCountryQuery(locations = [], countryQuery = '') {
  const normalizedCountryQuery = normalizeQuery(countryQuery);
  if (!normalizedCountryQuery) return [];

  const regions = new Set();

  locations.forEach((location) => {
    const parsed = splitLocation(location);
    if (!parsed.country || !parsed.region) return;

    if (normalizeQuery(parsed.country).includes(normalizedCountryQuery)) {
      regions.add(parsed.region);
    }
  });

  return sortLocations(regions);
}

export function matchesLocationFilters(locations = [], selectedCountry = '', regionQuery = '') {
  const normalizedCountry = normalizeQuery(selectedCountry);
  const normalizedRegion = normalizeQuery(regionQuery);

  if (!normalizedCountry && !normalizedRegion) {
    return true;
  }

  return locations.some((location) => {
    const parsed = splitLocation(location);

    if (normalizedCountry && !normalizeQuery(parsed.country).includes(normalizedCountry)) {
      return false;
    }

    if (!normalizedRegion) {
      return true;
    }

    return (
      parsed.region.toLowerCase().includes(normalizedRegion) ||
      parsed.raw.toLowerCase().includes(normalizedRegion)
    );
  });
}
