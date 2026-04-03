const legacyFindJobsFallback = [
  {
    id: 1,
    title: 'Social Media Assistant',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    categories: ['Marketing', 'Design'],
    logo: 'N',
    color: 'bg-emerald-500',
    applied: 5,
    capacity: 10,
    salary: 700,
    level: 'Entry Level',
  },
  {
    id: 2,
    title: 'Brand Designer',
    company: 'Dropbox',
    location: 'San Francisco, USA',
    type: 'Full-Time',
    categories: ['Design', 'Business'],
    logo: 'D',
    color: 'bg-blue-500',
    applied: 2,
    capacity: 8,
    salary: 1200,
    level: 'Mid Level',
  },
  {
    id: 3,
    title: 'Interactive Developer',
    company: 'Terraform',
    location: 'Hamburg, Germany',
    type: 'Full-Time',
    categories: ['Technology', 'Engineering'],
    logo: 'T',
    color: 'bg-purple-500',
    applied: 7,
    capacity: 12,
    salary: 1500,
    level: 'Senior Level',
  },
  {
    id: 4,
    title: 'Email Marketing',
    company: 'Revolut',
    location: 'Madrid, Spain',
    type: 'Full-Time',
    categories: ['Marketing', 'Design'],
    logo: 'R',
    color: 'bg-red-500',
    applied: 3,
    capacity: 6,
    salary: 800,
    level: 'Entry Level',
  },
  {
    id: 5,
    title: 'Lead Engineer',
    company: 'Canva',
    location: 'Ankara, Turkey',
    type: 'Full-Time',
    categories: ['Business', 'Design'],
    logo: 'Ca',
    color: 'bg-cyan-500',
    applied: 9,
    capacity: 15,
    salary: 2500,
    level: 'Director',
  },
  {
    id: 6,
    title: 'Product Designer',
    company: 'Classpass',
    location: 'Berlin, Germany',
    type: 'Full-Time',
    categories: ['Business', 'Design'],
    logo: 'Cp',
    color: 'bg-teal-500',
    applied: 4,
    capacity: 5,
    salary: 1100,
    level: 'Mid Level',
  },
  {
    id: 7,
    title: 'Customer Manager',
    company: 'Pitch',
    location: 'Berlin, Germany',
    type: 'Full-Time',
    categories: ['Marketing', 'Business'],
    logo: 'Pi',
    color: 'bg-gray-800',
    applied: 1,
    capacity: 4,
    salary: 900,
    level: 'Entry Level',
  },
  {
    id: 8,
    title: 'Visual Designer',
    company: 'Minted',
    location: 'Lyon, France',
    type: 'Full-Time',
    categories: ['Design', 'Marketing'],
    logo: 'Mi',
    color: 'bg-orange-500',
    applied: 6,
    capacity: 10,
    salary: 1300,
    level: 'Mid Level',
  },
];

const browseCompanyProfiles = [
  {
    id: 1,
    name: 'Nomad',
    description: 'Nomad builds remote-first tooling and community programs for distributed teams across Europe.',
    logo: 'N',
    color: 'bg-emerald-500',
    industry: 'Business Service',
    size: '51-150',
    tags: ['Remote Work', 'Community', 'Operations'],
    officeLocations: ['Paris, France', 'Remote'],
    jobs: [
      {
        id: 1,
        title: 'Social Media Assistant',
        location: 'Paris, France',
        type: 'Full-Time',
        categories: ['Marketing', 'Design'],
        applied: 5,
        capacity: 10,
        salary: 700,
        level: 'Entry Level',
      },
    ],
  },
  {
    id: 2,
    name: 'Dropbox',
    description: 'Dropbox designs collaboration products that help teams stay organized, aligned, and productive.',
    logo: 'D',
    color: 'bg-blue-500',
    industry: 'Cloud',
    size: '1001+',
    tags: ['Cloud', 'Productivity', 'Design'],
    officeLocations: ['San Francisco, USA', 'Dublin, Ireland'],
    jobs: [
      {
        id: 2,
        title: 'Brand Designer',
        location: 'San Francisco, USA',
        type: 'Full-Time',
        categories: ['Design', 'Business'],
        applied: 2,
        capacity: 8,
        salary: 1200,
        level: 'Mid Level',
      },
    ],
  },
  {
    id: 3,
    name: 'Terraform',
    description: 'Terraform helps engineering teams automate infrastructure delivery with reliable internal platforms.',
    logo: 'T',
    color: 'bg-purple-500',
    industry: 'Technology',
    size: '251-500',
    tags: ['Technology', 'Engineering', 'Open Source'],
    officeLocations: ['Hamburg, Germany', 'Remote'],
    jobs: [
      {
        id: 3,
        title: 'Interactive Developer',
        location: 'Hamburg, Germany',
        type: 'Full-Time',
        categories: ['Technology', 'Engineering'],
        applied: 7,
        capacity: 12,
        salary: 1500,
        level: 'Senior Level',
      },
      {
        id: 14,
        title: 'Interactive Developer',
        location: 'Hamburg, Germany',
        type: 'Contract',
        categories: ['Technology', 'Engineering'],
        applied: 7,
        capacity: 12,
        salary: 1500,
        level: 'Senior Level',
      },
    ],
  },
  {
    id: 4,
    name: 'Revolut',
    description: 'Revolut builds consumer finance products for people who expect banking, payments, and growth tools in one place.',
    logo: 'R',
    color: 'bg-red-500',
    industry: 'Fintech',
    size: '1001+',
    tags: ['Fintech', 'Payments', 'Growth'],
    officeLocations: ['Madrid, Spain', 'London, UK'],
    jobs: [
      {
        id: 4,
        title: 'Email Marketing',
        location: 'Madrid, Spain',
        type: 'Full-Time',
        categories: ['Marketing', 'Design'],
        applied: 3,
        capacity: 6,
        salary: 800,
        level: 'Entry Level',
      },
      {
        id: 10,
        title: 'Email Marketing',
        location: 'Madrid, Spain',
        type: 'Internship',
        categories: ['Marketing', 'Design'],
        applied: 3,
        capacity: 6,
        salary: 400,
        level: 'Entry Level',
      },
      {
        id: 15,
        title: 'Email Marketing',
        location: 'Madrid, Spain',
        type: 'Full-Time',
        categories: ['Marketing', 'Business'],
        applied: 3,
        capacity: 6,
        salary: 3000,
        level: 'VP or Above',
      },
    ],
  },
  {
    id: 5,
    name: 'Canva',
    description: 'Canva makes visual communication simple for teams by combining design workflows with scalable collaboration.',
    logo: 'Ca',
    color: 'bg-cyan-500',
    industry: 'Technology',
    size: '1001+',
    tags: ['Design', 'Technology', 'Collaboration'],
    officeLocations: ['Ankara, Turkey', 'Remote'],
    jobs: [
      {
        id: 5,
        title: 'Lead Engineer',
        location: 'Ankara, Turkey',
        type: 'Full-Time',
        categories: ['Business', 'Design'],
        applied: 9,
        capacity: 15,
        salary: 2500,
        level: 'Director',
      },
    ],
  },
  {
    id: 6,
    name: 'Classpass',
    description: 'Classpass connects product, growth, and wellness teams to shape consumer experiences that people return to daily.',
    logo: 'Cp',
    color: 'bg-teal-500',
    industry: 'Consumer Tech',
    size: '251-500',
    tags: ['Consumer Tech', 'Wellness', 'Product'],
    officeLocations: ['Berlin, Germany', 'Remote'],
    jobs: [
      {
        id: 6,
        title: 'Product Designer',
        location: 'Berlin, Germany',
        type: 'Full-Time',
        categories: ['Design', 'Business'],
        applied: 4,
        capacity: 5,
        salary: 1100,
        level: 'Mid Level',
      },
      {
        id: 11,
        title: 'Product Designer',
        location: 'Berlin, Germany',
        type: 'Full-Time',
        categories: ['Business', 'Design'],
        applied: 4,
        capacity: 5,
        salary: 2200,
        level: 'Director',
      },
      {
        id: 17,
        title: 'Product Designer',
        location: 'Berlin, Germany',
        type: 'Part-Time',
        categories: ['Business', 'Design'],
        applied: 4,
        capacity: 5,
        salary: 1100,
        level: 'Mid Level',
      },
    ],
  },
  {
    id: 7,
    name: 'Pitch',
    description: 'Pitch focuses on customer-facing software and go-to-market operations for modern revenue teams.',
    logo: 'Pi',
    color: 'bg-gray-800',
    industry: 'Technology',
    size: '151-250',
    tags: ['SaaS', 'Customer Success', 'Growth'],
    officeLocations: ['Berlin, Germany', 'Rome, Italy'],
    jobs: [
      {
        id: 7,
        title: 'Customer Manager',
        location: 'Berlin, Germany',
        type: 'Full-Time',
        categories: ['Business', 'Marketing'],
        applied: 1,
        capacity: 4,
        salary: 900,
        level: 'Entry Level',
      },
      {
        id: 12,
        title: 'Customer Manager',
        location: 'Rome, Italy',
        type: 'Full-Time',
        categories: ['Business', 'Marketing'],
        applied: 1,
        capacity: 4,
        salary: 950,
        level: 'Entry Level',
      },
    ],
  },
  {
    id: 8,
    name: 'Subtonify',
    description: 'Subtonify ships developer tools for subscription businesses that need strong data and backend workflows.',
    logo: 'Su',
    color: 'bg-yellow-600',
    industry: 'Technology',
    size: '51-150',
    tags: ['Developer Tools', 'Backend', 'SaaS'],
    officeLocations: ['Gothenburg, Sweden', 'Remote'],
    jobs: [
      {
        id: 9,
        title: 'Java Developer',
        location: 'Gothenburg, Sweden',
        type: 'Part-Time',
        categories: ['Technology', 'Engineering'],
        applied: 3,
        capacity: 7,
        salary: 1800,
        level: 'Senior Level',
      },
      {
        id: 13,
        title: 'Java Developer',
        location: 'Gothenburg, Sweden',
        type: 'Remote',
        categories: ['Technology', 'Engineering'],
        applied: 3,
        capacity: 7,
        salary: 1800,
        level: 'Senior Level',
      },
    ],
  },
];

const toBrowseJob = (company, job) => ({
  ...job,
  company: company.name,
  companyId: company.id,
  logo: company.logo,
  color: company.color,
});

export const browseCompanies = browseCompanyProfiles.map(({ jobs, ...company }) => ({
  ...company,
  jobs: jobs.length,
}));

export const browseCompanyJobs = browseCompanyProfiles.flatMap((company) =>
  company.jobs.map((job) => toBrowseJob(company, job))
);

export const findJobsFallback = browseCompanyJobs.length ? browseCompanyJobs : legacyFindJobsFallback;

export const getBrowseCompany = (idOrName) =>
  browseCompanyProfiles.find((company) =>
    company.id === Number(idOrName) ||
    company.name.toLowerCase() === String(idOrName).toLowerCase()
  );

export const getBrowseCompanyJobs = (idOrName) => {
  const company = getBrowseCompany(idOrName);
  return company ? company.jobs.map((job) => toBrowseJob(company, job)) : [];
};

export const getBrowseCompanyJob = (companyId, jobId) =>
  getBrowseCompanyJobs(companyId).find((job) => String(job.id) === String(jobId));

export const getBrowseCompanyOfficeLocations = (companyId) =>
  getBrowseCompany(companyId)?.officeLocations || [];

export const allBrowseCompanyOfficeLocations = [...new Set(
  browseCompanyProfiles.flatMap((company) => company.officeLocations)
)].sort((left, right) => left.localeCompare(right));

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

const decodeRouteValue = (value) => {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return String(value || '');
  }
};

const normalizeCategories = (categories) => {
  if (Array.isArray(categories)) return categories.filter(Boolean);
  if (typeof categories !== 'string') return [];
  return categories.split(',').map((category) => category.trim()).filter(Boolean);
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const inferIndustry = (categories) => {
  if (categories.includes('Finance')) return 'Fintech';
  if (categories.includes('Technology') || categories.includes('Engineering')) return 'Technology';
  if (categories.includes('Design')) return 'Advertising';
  if (categories.includes('Marketing')) return 'Business Service';
  return 'Technology';
};

const inferTags = (categories) => {
  if (categories.length === 0) return ['Hiring'];
  return categories.slice(0, 3);
};

const inferSize = (jobCount) => {
  if (jobCount >= 8) return '1001+';
  if (jobCount >= 5) return '501-1000';
  if (jobCount >= 3) return '251-500';
  if (jobCount >= 2) return '51-150';
  return '1-50';
};

const inferDescription = (companyName, categories, jobCount) => {
  const categoryCopy = categories.slice(0, 2).join(' and ') || 'high-growth';
  return `${companyName} is hiring across ${categoryCopy} roles with ${jobCount} active opening${jobCount === 1 ? '' : 's'}.`;
};

const enrichCompanyJob = (job, company) => ({
  ...job,
  company: company.name,
  companyId: company.id,
  logo: job.logo || company.logo,
  color: job.color || company.color,
  categories: normalizeCategories(job.categories),
});

const getStaticCompanyProfile = (identifier) =>
  browseCompanyProfiles.find((company) =>
    company.id === Number(identifier) ||
    normalizeText(company.name) === normalizeText(decodeRouteValue(identifier))
  );

export const getCompanyRouteId = (company) => encodeURIComponent(company.name);

export const resolveCompanyName = (identifier) => {
  const staticCompany = getStaticCompanyProfile(identifier);
  if (staticCompany) return staticCompany.name;
  return decodeRouteValue(identifier);
};

const buildCompanyFromJobs = (companyName, jobs) => {
  const staticCompany = getStaticCompanyProfile(companyName);
  const categories = unique(jobs.flatMap((job) => normalizeCategories(job.categories)));
  const officeLocations = staticCompany?.officeLocations?.length
    ? staticCompany.officeLocations
    : unique(jobs.map((job) => job.location));

  return {
    id: staticCompany?.id || companyName,
    name: companyName,
    description: staticCompany?.description || inferDescription(companyName, categories, jobs.length),
    logo: staticCompany?.logo || jobs[0]?.logo || companyName.slice(0, 2).toUpperCase(),
    color: staticCompany?.color || jobs[0]?.color || 'bg-blue-600',
    industry: staticCompany?.industry || inferIndustry(categories),
    size: staticCompany?.size || inferSize(jobs.length),
    tags: staticCompany?.tags || inferTags(categories),
    officeLocations,
    jobs: jobs.length,
  };
};

export const buildBrowseCompaniesFromJobs = (jobs = []) => {
  if (!jobs.length) {
    return browseCompanies.map((company) => ({
      ...company,
      officeLocations: getBrowseCompanyOfficeLocations(company.id),
    }));
  }

  const groupedJobs = new Map();

  jobs.forEach((job) => {
    const companyName = (job.company || '').trim();
    if (!companyName) return;
    const currentJobs = groupedJobs.get(companyName) || [];
    currentJobs.push(job);
    groupedJobs.set(companyName, currentJobs);
  });

  return [...groupedJobs.entries()]
    .map(([companyName, companyJobs]) => buildCompanyFromJobs(companyName, companyJobs))
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const buildBrowseCompanyDetailsFromJobs = (identifier, jobs = []) => {
  const companyName = resolveCompanyName(identifier);
  const matchingJobs = jobs.filter((job) => normalizeText(job.company) === normalizeText(companyName));

  if (matchingJobs.length > 0) {
    const company = buildCompanyFromJobs(companyName, matchingJobs);
    return {
      company,
      jobs: matchingJobs.map((job) => enrichCompanyJob(job, company)),
    };
  }

  const staticCompany = getStaticCompanyProfile(identifier);

  if (staticCompany) {
    const company = {
      ...staticCompany,
      officeLocations: staticCompany.officeLocations,
      jobs: staticCompany.jobs.length,
    };

    return {
      company,
      jobs: staticCompany.jobs.map((job) => enrichCompanyJob(job, company)),
    };
  }

  return {
    company: {
      id: companyName,
      name: companyName,
      description: `${companyName} is hiring right now.`,
      logo: companyName.slice(0, 2).toUpperCase(),
      color: 'bg-blue-600',
      industry: 'Technology',
      size: '1-50',
      tags: ['Hiring'],
      officeLocations: [],
      jobs: 0,
    },
    jobs: [],
  };
};
