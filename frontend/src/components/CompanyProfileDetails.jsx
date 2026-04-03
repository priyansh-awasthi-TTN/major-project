import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const EMPLOYEE_RANGE_BY_SIZE = {
  '1-50': '25-50',
  '51-150': '51-150',
  '151-250': '151-250',
  '251-500': '251-500',
  '501-1000': '501-1000',
  '1001+': '1000+',
};

const PERK_CORE_LIBRARY = [
  { icon: '🏥', label: 'Health Coverage', desc: 'Medical support and wellbeing coverage designed to keep teams healthy and consistent.' },
  { icon: '📚', label: 'Learning Budget', desc: 'Dedicated budget for courses, certifications, books, and workshops tied to growth.' },
];

const PERK_LIBRARY = [
  { icon: '🏖️', label: 'Flexible Time Off', desc: 'Planned flexibility so teams can recharge without losing delivery rhythm.' },
  { icon: '🏠', label: 'Remote Flexibility', desc: 'Teams collaborate across office and remote setups depending on role needs.' },
  { icon: '💻', label: 'Home Office Setup', desc: 'Equipment support for productive hybrid or remote work environments.' },
  { icon: '🚌', label: 'Commuter Support', desc: 'Travel reimbursements or transit support for employees working on-site.' },
  { icon: '🤝', label: 'Team Offsites', desc: 'Structured in-person planning sessions to help cross-functional teams reset and align.' },
  { icon: '❤️', label: 'Community Giveback', desc: 'Support for volunteering and donation matching to reinforce team impact beyond work.' },
  { icon: '💸', label: 'Performance Bonus', desc: 'Variable compensation tied to individual and company delivery milestones.' },
  { icon: '🧠', label: 'Wellness Support', desc: 'Mental-health and wellness support that reduces burnout risk during heavy delivery cycles.' },
  { icon: '📈', label: 'Equity Upside', desc: 'Longer-term incentives aligned with company growth and sustained execution.' },
  { icon: '🎤', label: 'Conference Travel', desc: 'Budget for conferences, events, and market-facing learning opportunities.' },
  { icon: '🛠️', label: 'Tooling Stipend', desc: 'Team budget for the software, subscriptions, and devices needed to move efficiently.' },
  { icon: '🧾', label: 'Certification Support', desc: 'Reimbursement for role-relevant exams and external credential programs.' },
];

const PERK_LIBRARY_BY_KEYWORD = {
  remote: [
    { icon: '🏠', label: 'Remote Flexibility', desc: 'Teams collaborate across office and remote setups depending on role needs.' },
    { icon: '💻', label: 'Home Office Setup', desc: 'Equipment support for productive hybrid or remote work environments.' },
    { icon: '🌍', label: 'Distributed Team Weeks', desc: 'Periodic in-person planning weeks that help remote teams reset and align.' },
  ],
  office: [
    { icon: '🚌', label: 'Commuter Support', desc: 'Travel reimbursements or transit support for employees working on-site.' },
    { icon: '🏢', label: 'Office Meal Support', desc: 'Shared meal and snack support for teams collaborating on-site.' },
  ],
  technology: [
    { icon: '🛠️', label: 'Tooling Stipend', desc: 'Team budget for the software, subscriptions, and devices needed to move efficiently.' },
    { icon: '🧪', label: 'Innovation Time', desc: 'Reserved time for prototypes, internal experiments, and technical exploration.' },
  ],
  engineering: [
    { icon: '🚀', label: 'Shipping Autonomy', desc: 'Engineers are trusted to scope, ship, and improve systems with minimal process drag.' },
    { icon: '🧱', label: 'Architecture Guilds', desc: 'Cross-team groups review reliability, platform design, and technical direction.' },
  ],
  design: [
    { icon: '🎨', label: 'Creative Tool Budget', desc: 'Dedicated access to modern design tooling, research platforms, and production software.' },
    { icon: '🖼️', label: 'Portfolio Time', desc: 'Structured time to document launches, craft quality, and measurable design outcomes.' },
  ],
  marketing: [
    { icon: '📣', label: 'Campaign Experiment Budget', desc: 'Teams can test channels and campaign ideas without waiting on quarterly resets.' },
    { icon: '🤝', label: 'Creator Partnerships', desc: 'Support for events, content collaborations, and external brand partnerships.' },
  ],
  finance: [
    { icon: '📈', label: 'Equity Upside', desc: 'Longer-term incentives aligned with company growth and sustained execution.' },
    { icon: '🔒', label: 'Risk & Compliance Training', desc: 'Regular training support for teams working with regulated systems and customer trust.' },
  ],
  business: [
    { icon: '🎯', label: 'Cross-Functional Mentoring', desc: 'Structured mentoring that helps operators work across sales, product, and delivery lines.' },
    { icon: '📊', label: 'Revenue Visibility', desc: 'Teams get practical access to business performance signals instead of only top-line summaries.' },
  ],
  cloud: [
    { icon: '☁️', label: 'Cloud Certification Support', desc: 'Budget and study time for cloud and infrastructure credential programs.' },
    { icon: '🛡️', label: 'Reliability Rotations', desc: 'Planned reliability and platform rotation work tied to clear recovery support.' },
  ],
  fintech: [
    { icon: '💸', label: 'Performance Bonus', desc: 'Variable compensation tied to individual and company delivery milestones.' },
    { icon: '🛡️', label: 'Fraud & Compliance Training', desc: 'Regular operating support for teams working in payments, trust, and regulated environments.' },
  ],
  growth: [
    { icon: '🧪', label: 'Experimentation Budget', desc: 'Teams can validate growth ideas quickly with clean measurement and room to iterate.' },
  ],
  productivity: [
    { icon: '🕰️', label: 'Focus Fridays', desc: 'Protected blocks of low-meeting time for deep work and documentation.' },
  ],
  collaboration: [
    { icon: '🗣️', label: 'Team Communication Coaching', desc: 'Support for written communication, facilitation, and cross-functional decision making.' },
  ],
  community: [
    { icon: '❤️', label: 'Community Giveback', desc: 'Support for volunteering and donation matching to reinforce team impact beyond work.' },
  ],
  small: [
    { icon: '🌱', label: 'Growth Tracks', desc: 'Faster role-shaping opportunities for teams still defining scope and ownership.' },
  ],
  large: [
    { icon: '🎓', label: 'Leadership Programs', desc: 'Structured management and leadership programs for employees taking on broader scope.' },
  ],
};

const FIRST_NAMES = ['Aarav', 'Maya', 'Lena', 'Noah', 'Ishaan', 'Ava', 'Riya', 'Kai', 'Sofia', 'Milan', 'Zara', 'Arjun'];
const LAST_NAMES = ['Patel', 'Reed', 'Shaw', 'Morgan', 'Singh', 'Lopez', 'Parker', 'Kim', 'Walker', 'Nair', 'Chen', 'Martin'];

const ROLE_BY_KEYWORD = {
  technology: 'Engineering Lead',
  engineering: 'Platform Lead',
  design: 'Product Design Lead',
  marketing: 'Growth Lead',
  business: 'Operations Lead',
  finance: 'Risk Lead',
  cloud: 'Infrastructure Lead',
  fintech: 'Payments Lead',
  advertising: 'Creative Lead',
  collaboration: 'Product Lead',
  community: 'Community Lead',
  operations: 'People Operations Lead',
  productivity: 'Product Strategy Lead',
};

const FALLBACK_ROLES = [
  'Talent Partner',
  'Customer Success Lead',
  'People Operations Lead',
  'Data Lead',
  'Program Manager',
  'Partnerships Lead',
];

const TECH_STACK_BY_KEYWORD = {
  technology: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
  engineering: ['Go', 'Docker', 'GraphQL', 'Redis'],
  design: ['Figma', 'Storybook', 'Adobe CC', 'Framer'],
  marketing: ['HubSpot', 'Google Analytics', 'Contentful', 'Braze'],
  business: ['Notion', 'Airtable', 'Looker', 'Salesforce'],
  finance: ['Python', 'SQL', 'Kafka', 'Snowflake'],
  cloud: ['AWS', 'Kubernetes', 'Terraform', 'Prometheus'],
  fintech: ['Java', 'Kafka', 'PostgreSQL', 'Stripe API'],
  advertising: ['After Effects', 'Illustrator', 'Figma', 'Contentful'],
  collaboration: ['WebRTC', 'TypeScript', 'React', 'GraphQL'],
  community: ['Slack', 'Notion', 'Zendesk', 'Discord'],
  operations: ['Airtable', 'Asana', 'Zapier', 'Looker'],
  productivity: ['Electron', 'React', 'Node.js', 'Redis'],
  payments: ['Java', 'Kafka', 'Go', 'PostgreSQL'],
  growth: ['Amplitude', 'Braze', 'Segment', 'Looker'],
  remote: ['Zoom', 'Slack', 'Notion', 'Miro'],
};

const TECH_STACK_FALLBACK = ['JavaScript', 'REST APIs', 'GitHub Actions', 'SQL', 'Figma', 'Slack', 'Docker', 'Vercel'];

const TECH_TONE_CLASSES = [
  'bg-slate-100 text-slate-700',
  'bg-blue-50 text-blue-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
  'bg-violet-50 text-violet-700',
];

const TEAM_AVATAR_TONES = [
  'bg-slate-100',
  'bg-blue-100',
  'bg-emerald-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-violet-100',
];

const DEFAULT_VISIBLE_JOB_COUNT = 2;

const REVIEW_TIMES = ['2 weeks ago', '1 month ago', '2 months ago', '4 months ago', '8 months ago'];
const REVIEW_AUDIENCES = ['Current employee', 'Former employee', 'Interview candidate', 'Hiring manager'];

const HIGHLIGHT_STYLES = [
  'from-blue-100 to-indigo-100',
  'from-emerald-100 to-teal-100',
  'from-amber-100 to-rose-100',
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(values, getKey) {
  const seen = new Set();

  return values.filter((value) => {
    const key = getKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCategories(categories) {
  if (Array.isArray(categories)) return categories.filter(Boolean);
  if (typeof categories !== 'string') return [];
  return categories.split(',').map((category) => category.trim()).filter(Boolean);
}

function normalizeKeywords(values) {
  return unique(
    values.flatMap((value) =>
      String(value || '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean),
    ),
  );
}

function hashValue(value) {
  return String(value || '').split('').reduce((total, character) => total + character.charCodeAt(0), 0);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTitleCase(value) {
  return String(value || '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Not listed';
  return `$${Math.round(value).toLocaleString()}`;
}

function formatStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));
}

function buildFoundedLabel(companyName) {
  const seed = hashValue(companyName);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (seed % 27) + 1;
  const month = monthNames[seed % monthNames.length];
  const year = 2008 + (seed % 13);
  return `${month} ${day}, ${year}`;
}

function buildEmployeeRange(size) {
  return EMPLOYEE_RANGE_BY_SIZE[size] || '50+';
}

function buildContactLinks(company, website) {
  const slug = slugify(company.name || 'company');
  return [
    { icon: '🌐', label: website.replace(/^https?:\/\//, ''), href: website, external: true },
    { icon: '✉️', label: `hello@${slug}.com`, href: `mailto:hello@${slug}.com`, external: false },
    { icon: '💼', label: `linkedin.com/company/${slug}`, href: `https://linkedin.com/company/${slug}`, external: true },
  ];
}

function buildOfficeEntries(locations) {
  if (!locations.length) return [];

  let physicalOfficeCount = 0;

  return locations.map((location) => {
    const lowerLocation = String(location).toLowerCase();

    if (lowerLocation.includes('remote')) {
      return {
        label: location,
        type: 'Remote Hub',
        summary: 'Distributed hiring support',
      };
    }

    physicalOfficeCount += 1;
    return {
      label: location,
      type: physicalOfficeCount === 1 ? 'Head Office' : 'Regional Office',
      summary: physicalOfficeCount === 1 ? 'Core leadership and hiring hub' : 'Local delivery and hiring team',
    };
  });
}

function buildTechStack(company, jobs) {
  const categories = unique(jobs.flatMap((job) => normalizeCategories(job.categories)));
  const keywords = normalizeKeywords([
    company.industry,
    ...(company.tags || []),
    ...categories,
    ...(company.officeLocations || []).filter((location) => String(location).toLowerCase().includes('remote') ? 'remote' : ''),
  ]);

  const stack = [];
  keywords.forEach((keyword) => {
    (TECH_STACK_BY_KEYWORD[keyword] || []).forEach((item) => {
      if (!stack.includes(item)) {
        stack.push(item);
      }
    });
  });

  TECH_STACK_FALLBACK.forEach((item) => {
    if (!stack.includes(item)) {
      stack.push(item);
    }
  });

  return stack.slice(0, 10).map((item, index) => ({
    name: item,
    toneClass: TECH_TONE_CLASSES[index % TECH_TONE_CLASSES.length],
  }));
}

function rotateItems(values, seed) {
  if (values.length <= 1) return values;

  const offset = seed % values.length;
  return values.slice(offset).concat(values.slice(0, offset));
}

function buildCompanyKeywordContext(company, jobs) {
  const categories = unique(jobs.flatMap((job) => normalizeCategories(job.categories)));
  const remoteFriendly = (company.officeLocations || []).some((location) => String(location).toLowerCase().includes('remote'));
  const keywords = normalizeKeywords([
    company.industry,
    ...(company.tags || []),
    ...categories,
    remoteFriendly ? 'remote' : 'office',
    ['1001+', '501-1000'].includes(company.size) ? 'large' : 'small',
  ]);

  return {
    categories,
    keywords,
    remoteFriendly,
  };
}

function buildTeamMembers(company, jobs) {
  const categories = unique(jobs.flatMap((job) => normalizeCategories(job.categories))).map((item) => item.toLowerCase());
  const rolePool = unique([
    ...categories.map((category) => ROLE_BY_KEYWORD[category]),
    ROLE_BY_KEYWORD[String(company.industry || '').toLowerCase()],
    ...FALLBACK_ROLES,
  ]);
  const memberCount = Math.max(5, Math.min(8, jobs.length + 4));
  const seed = hashValue(company.name);

  return Array.from({ length: memberCount }, (_, index) => {
    const firstName = FIRST_NAMES[(seed + index * 3) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(seed + index * 5) % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const role = rolePool[index % rolePool.length] || FALLBACK_ROLES[index % FALLBACK_ROLES.length];
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return {
      name,
      role,
      initials,
    };
  });
}

function buildHighlights(company, jobs, officeEntries) {
  const categories = unique(jobs.flatMap((job) => normalizeCategories(job.categories)));
  const topFocus = categories.slice(0, 2).join(' + ') || company.industry || 'Hiring';
  const salaryValues = jobs
    .map((job) => Number(job.salary))
    .filter((salary) => Number.isFinite(salary));
  const averageSalary = salaryValues.length
    ? Math.round(salaryValues.reduce((total, salary) => total + salary, 0) / salaryValues.length)
    : null;
  const remoteFriendly = (company.officeLocations || []).some((location) => String(location).toLowerCase().includes('remote'));
  const workStyle = remoteFriendly ? 'Hybrid / Remote-friendly' : 'Office-led';

  return [
    {
      label: 'Primary focus',
      value: topFocus,
      caption: `${jobs.length || company.jobs || 0} active role${(jobs.length || company.jobs || 0) === 1 ? '' : 's'} mapped to current demand`,
    },
    {
      label: 'Salary snapshot',
      value: averageSalary ? `${formatCurrency(averageSalary)}/mo` : 'Comp varies',
      caption: salaryValues.length > 0 ? 'Based on visible salary fields' : 'Salary details are role-specific',
    },
    {
      label: 'Work model',
      value: workStyle,
      caption: officeEntries.length > 0 ? `Hiring across ${officeEntries.length} location${officeEntries.length === 1 ? '' : 's'}` : 'Location details coming soon',
    },
  ];
}

function buildReviews(company, jobs, officeEntries) {
  const seed = hashValue(company.name);
  const { categories, remoteFriendly } = buildCompanyKeywordContext(company, jobs);
  const focusLabel = toTitleCase(categories[0] || company.industry || 'Product');
  const secondaryLabel = toTitleCase(categories[1] || company.tags?.[0] || company.industry || 'Operations');
  const officeLabel = officeEntries.find((entry) => entry.type !== 'Remote Hub')?.label || 'the team hub';
  const hiringCount = jobs.length || company.jobs || 0;
  const reviewLibrary = [
    {
      id: 'ownership',
      title: `Ownership around ${focusLabel} is unusually clear`,
      body: `${company.name} sets expectations well, so people working on ${focusLabel.toLowerCase()} can move without constant second-guessing. Teams still get context, but it does not feel overmanaged.`,
    },
    {
      id: 'interview',
      title: 'Interview loop felt relevant to the actual work',
      body: `The hiring process stayed close to the role instead of drifting into generic questions. It was clear how ${company.name} evaluates delivery across ${focusLabel.toLowerCase()} and ${secondaryLabel.toLowerCase()}.`,
    },
    {
      id: 'collaboration',
      title: `Cross-functional work between ${focusLabel} and ${secondaryLabel} is solid`,
      body: `People across product, design, and operations seem to share the same priorities. Hand-offs are lighter than expected and the collaboration model feels mature for a team of this size.`,
    },
    {
      id: 'work-model',
      title: remoteFriendly ? 'Remote collaboration is treated seriously' : 'Office collaboration feels intentional',
      body: remoteFriendly
        ? `${company.name} has clear habits for async updates, decisions, and follow-through. Remote work feels like the default operating model rather than a compromise.`
        : `Working with the team around ${officeLabel} seems structured and useful. On-site time appears to be used for alignment and decision-making rather than performative attendance.`,
    },
    {
      id: 'impact',
      title: 'You can connect work to visible outcomes',
      body: `With ${hiringCount} active role${hiringCount === 1 ? '' : 's'} open, the company seems to hire around real priorities. People can see where their work lands and why those roles matter.`,
    },
    {
      id: 'growth',
      title: 'Good environment for compounding skills quickly',
      body: `${company.name} looks like a place where strong people can build depth fast. There is enough range across ${focusLabel.toLowerCase()} work to learn without the team feeling directionless.`,
    },
    {
      id: 'tools',
      title: `Tooling and process appear aligned with ${focusLabel.toLowerCase()} work`,
      body: `The team seems to invest in the systems needed to keep ${focusLabel.toLowerCase()} moving. Work quality benefits from that because people are not constantly patching around broken process.`,
    },
    {
      id: 'leadership',
      title: 'Managers seem to give context instead of noise',
      body: `Leadership at ${company.name} appears to set direction clearly and then let teams execute. That balance is hard to get right, and it shows up in how people describe the pace.`,
    },
    {
      id: 'pace',
      title: 'Fast-moving, but not randomly chaotic',
      body: `${company.name} still looks ambitious, but the operating rhythm seems better than the usual growth-stage scramble. Priorities around ${secondaryLabel.toLowerCase()} feel sharper than average.`,
    },
    {
      id: 'craft',
      title: `There is real attention to quality in ${focusLabel.toLowerCase()}`,
      body: `What stands out is the emphasis on polish and follow-through. The team seems to care about how things are built, not only about shipping them quickly.`,
    },
  ];

  return rotateItems(reviewLibrary, seed).slice(0, 4).map((template, index) => ({
    ...template,
    rating: 4 + ((seed + index) % 2),
    audience: REVIEW_AUDIENCES[(seed + index) % REVIEW_AUDIENCES.length],
    time: REVIEW_TIMES[(seed + index) % REVIEW_TIMES.length],
  }));
}

function buildPerks(company, jobs) {
  const seed = hashValue(`${company.name}-perks`);
  const { keywords, remoteFriendly } = buildCompanyKeywordContext(company, jobs);
  const contextPerks = keywords.flatMap((keyword) => PERK_LIBRARY_BY_KEYWORD[keyword] || []);
  const fallbackPerks = remoteFriendly
    ? PERK_LIBRARY
    : PERK_LIBRARY.filter((perk) => perk.label !== 'Remote Flexibility' && perk.label !== 'Home Office Setup');
  const mixedPerks = uniqueBy(
    [
      ...PERK_CORE_LIBRARY,
      ...rotateItems(contextPerks, seed),
      ...rotateItems(fallbackPerks, seed),
    ],
    (perk) => perk.label,
  );

  return [
    ...PERK_CORE_LIBRARY,
    ...mixedPerks.filter((perk) => !PERK_CORE_LIBRARY.some((corePerk) => corePerk.label === perk.label)).slice(0, 4),
  ];
}

function buildCompanyProfileModel(company, jobs) {
  const displayJobCount = jobs.length || company.jobs || 0;
  const officeEntries = buildOfficeEntries(company.officeLocations || []);
  const website = `https://${slugify(company.name || 'company') || 'company'}.com`;
  const teamMembers = buildTeamMembers(company, jobs);
  const techStack = buildTechStack(company, jobs);
  const reviews = buildReviews(company, jobs, officeEntries);
  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : '4.5';

  return {
    website,
    founded: buildFoundedLabel(company.name),
    employees: buildEmployeeRange(company.size),
    officeEntries,
    officeLocationSummary: officeEntries.length === 1 ? '1 office location' : `${officeEntries.length} office locations`,
    contacts: buildContactLinks(company, website),
    techStack,
    teamMembers,
    highlights: buildHighlights(company, jobs, officeEntries),
    reviews,
    averageRating,
    perks: buildPerks(company, jobs),
    displayJobCount,
    description: `${company.description || `${company.name} is hiring right now.`} ${company.name} is building for ${toTitleCase(company.industry || 'technology')} teams and keeping hiring signals visible across the company page.`,
  };
}

function HighlightCard({ card, index }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${HIGHLIGHT_STYLES[index % HIGHLIGHT_STYLES.length]} p-4`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{card.label}</p>
      <p className="mt-3 text-lg font-bold text-gray-900">{card.value}</p>
      <p className="mt-2 text-sm text-gray-600">{card.caption}</p>
    </div>
  );
}

export default function CompanyProfileDetails({
  company,
  jobs,
  browseJobsHref,
  jobHrefBuilder,
}) {
  const [showAllTeam, setShowAllTeam] = useState(false);
  const [showAllTech, setShowAllTech] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);

  useEffect(() => {
    setShowAllTeam(false);
    setShowAllTech(false);
    setShowAllLocations(false);
    setShowAllReviews(false);
    setShowAllJobs(false);
  }, [company.name]);

  const profile = useMemo(() => buildCompanyProfileModel(company, jobs), [company, jobs]);
  const visibleTeamMembers = showAllTeam ? profile.teamMembers : profile.teamMembers.slice(0, 5);
  const visibleTechStack = showAllTech ? profile.techStack : profile.techStack.slice(0, 6);
  const visibleLocations = showAllLocations ? profile.officeEntries : profile.officeEntries.slice(0, 2);
  const visibleReviews = showAllReviews ? profile.reviews : profile.reviews.slice(0, 2);
  const visibleJobs = showAllJobs ? jobs : jobs.slice(0, DEFAULT_VISIBLE_JOB_COUNT);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="h-28 bg-gradient-to-r from-blue-500 to-purple-600" />
            <div className="px-6 pb-6">
              <div className="-mt-8 mb-4 flex items-end justify-between gap-4">
                <div className={`${company.color || 'bg-blue-600'} flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border-4 border-white text-2xl font-bold text-white`}>
                  {company.logo || company.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-600">
                  {profile.displayJobCount} Job{profile.displayJobCount === 1 ? '' : 's'}
                </span>
              </div>

              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="mb-3 mt-1 inline-flex text-sm text-blue-500 hover:underline"
              >
                {profile.website}
              </a>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                <span>📅 Founded: {profile.founded}</span>
                <span>👥 {profile.employees}</span>
                <span>📍 {profile.officeLocationSummary}</span>
                <span>🏷️ {company.industry}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 font-bold text-gray-900">Company Profile</h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">{profile.description}</p>

            <h3 className="mb-3 text-sm font-semibold text-gray-900">Contact</h3>
            <div className="flex flex-wrap gap-3">
              {profile.contacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.external ? '_blank' : undefined}
                  rel={contact.external ? 'noreferrer' : undefined}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <span>{contact.icon}</span>
                  <span>{contact.label}</span>
                </a>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {profile.highlights.map((card, index) => (
                <HighlightCard key={card.label} card={card} index={index} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-bold text-gray-900">Team</h2>
              {profile.teamMembers.length > 5 && (
                <button
                  onClick={() => setShowAllTeam((current) => !current)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showAllTeam ? 'Show less team members' : `See all (${profile.teamMembers.length})`}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {visibleTeamMembers.map((member, index) => (
                <div key={`${member.name}-${member.role}`} className="text-center">
                  <div className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full ${TEAM_AVATAR_TONES[index % TEAM_AVATAR_TONES.length]} text-sm font-bold text-gray-800`}>
                    {member.initials}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{member.name}</p>
                  <p className="mt-1 text-xs text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-1 font-bold text-gray-900">Perks & Benefits</h2>
            <p className="mb-5 text-sm text-gray-400">Benefits and team support signals derived from the company hiring profile.</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profile.perks.map((perk) => (
                <div key={perk.label} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 text-2xl">{perk.icon}</div>
                  <p className="mb-1 text-sm font-semibold text-gray-800">{perk.label}</p>
                  <p className="text-xs leading-relaxed text-gray-400">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-bold text-gray-900">Company Reviews</h2>
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-600">
                {formatStars(Math.round(Number(profile.averageRating)))} {profile.averageRating}
              </span>
            </div>

            <div className="space-y-4">
              {visibleReviews.map((review, index) => (
                <div key={`${review.title}-${index}`} className={index < visibleReviews.length - 1 ? 'border-b border-gray-100 pb-4' : ''}>
                  <p className="text-sm font-semibold text-gray-800">"{review.title}"</p>
                  <div className="mb-2 mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="text-yellow-400">{formatStars(review.rating)}</span>
                    <span>{review.audience}</span>
                    <span>{review.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600">{review.body}</p>
                </div>
              ))}
            </div>

            {profile.reviews.length > 2 && (
              <button
                onClick={() => setShowAllReviews((current) => !current)}
                className="mt-4 w-full text-center text-xs font-medium text-blue-600 hover:underline"
              >
                {showAllReviews ? 'Show fewer reviews' : `See all ${profile.reviews.length} reviews`}
              </button>
            )}
          </div>

          <div>
            <div className="mb-4 mt-2 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Open Jobs</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Link to={browseJobsHref} className="text-blue-600 hover:underline">
                  Show all jobs →
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {jobs.length === 0 ? (
                <div className="col-span-full rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <p className="text-sm font-medium text-gray-600">No open positions currently available</p>
                </div>
              ) : (
                visibleJobs.map((job) => {
                  const categories = normalizeCategories(job.categories);
                  const capacity = typeof job.capacity === 'number' && job.capacity > 0 ? job.capacity : 10;
                  const applied = typeof job.applied === 'number' ? job.applied : 0;
                  const progress = Math.min((applied / capacity) * 100, 100);

                  return (
                    <Link
                      key={job.id}
                      to={jobHrefBuilder(job)}
                      className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <div className={`${job.color || company.color || 'bg-blue-600'} flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-bold text-white`}>
                          {job.logo || company.logo || company.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {job.company || company.name} • {job.location}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {job.type && (
                          <span className="rounded border border-green-500 px-2 py-0.5 text-xs text-green-600">
                            {job.type}
                          </span>
                        )}
                        {categories.map((category) => (
                          <span
                            key={category}
                            className="rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      <div className="mb-1 h-1.5 w-full rounded-full bg-gray-200">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-xs text-gray-400">
                        <span className="font-medium text-gray-600">{applied} applied</span> of {capacity} capacity
                      </p>
                    </Link>
                  );
                })
              )}
            </div>

            {jobs.length > DEFAULT_VISIBLE_JOB_COUNT && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAllJobs((current) => !current)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showAllJobs ? 'Show less' : `Show more (${jobs.length - DEFAULT_VISIBLE_JOB_COUNT})`}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-gray-900">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {visibleTechStack.map((tech) => (
                <span key={tech.name} className={`rounded px-2 py-1 text-xs ${tech.toneClass}`}>
                  ⚙️ {tech.name}
                </span>
              ))}
            </div>
            {profile.techStack.length > 6 && (
              <button
                onClick={() => setShowAllTech((current) => !current)}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                {showAllTech ? 'Show less tech stack' : `View tech stack (${profile.techStack.length}) →`}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-gray-900">Office Location</h3>
            <p className="mb-3 text-sm text-gray-500">
              {profile.officeEntries.length > 0
                ? `${company.name} operates across ${profile.officeLocationSummary}`
                : `${company.name} will share office locations soon`}
            </p>

            <div className="space-y-3 text-sm">
              {profile.officeEntries.length > 0 ? (
                visibleLocations.map((location) => (
                  <div key={`${location.label}-${location.type}`}>
                    <p className="font-medium text-gray-700">{location.label}</p>
                    <p className="text-xs text-gray-400">{location.type} • {location.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Office locations coming soon</p>
              )}
            </div>

            {profile.officeEntries.length > 2 && (
              <button
                onClick={() => setShowAllLocations((current) => !current)}
                className="mt-3 text-xs text-blue-600 hover:underline"
              >
                {showAllLocations ? 'Show fewer locations' : `View locations (${profile.officeEntries.length}) →`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
