import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import CompanyTopBar from '../../components/CompanyTopBar';
import { buildBrowseCompanyDetailsFromJobs, getCompanyRouteId } from '../../data/discoveryData';
import { companies, getCompanyOfficeLocations, jobs as browseJobs } from '../../data/mockData';
import { jobListings, teamMembers } from '../../data/companyMockData';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
];

const TEAM_PHOTOS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
];

const TECH_STACK = [
  { name: 'HTML 5', short: 'H5', tone: 'border-orange-200 bg-orange-50 text-orange-700' },
  { name: 'CSS 3', short: 'C3', tone: 'border-sky-200 bg-sky-50 text-sky-700' },
  { name: 'JavaScript', short: 'JS', tone: 'border-amber-200 bg-amber-50 text-amber-700' },
  { name: 'Ruby', short: 'RB', tone: 'border-rose-200 bg-rose-50 text-rose-700' },
  { name: 'Mixpanel', short: 'MX', tone: 'border-violet-200 bg-violet-50 text-violet-700' },
  { name: 'Framer', short: 'FR', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
];

const BENEFITS = [
  {
    title: 'Full Healthcare',
    description: 'Medical, dental, and mental health coverage for full-time teammates.',
    icon: BuildingOffice2Icon,
  },
  {
    title: 'Unlimited Vacation',
    description: 'Flexible time off with lightweight planning so teams can still ship well.',
    icon: BriefcaseIcon,
  },
  {
    title: 'Skill Development',
    description: 'Annual support for courses, certifications, events, and practical tooling.',
    icon: ArrowTopRightOnSquareIcon,
  },
  {
    title: 'Team Summits',
    description: 'Quarterly in-person sessions for planning, reviews, and relationship building.',
    icon: UserGroupIcon,
  },
  {
    title: 'Remote Working',
    description: 'Home office budget and async-first workflows for distributed collaboration.',
    icon: GlobeAltIcon,
  },
  {
    title: 'Commuter Benefit',
    description: 'Transport support for teammates working from office hubs each week.',
    icon: MapPinIcon,
  },
];

const ROLE_TAGS = {
  'Social Media Assistant': ['Marketing', 'Design'],
  'Brand Designer': ['Business', 'Design'],
  'Visual Designer': ['Design', 'Brand'],
  'Data Science': ['Analytics', 'Engineering'],
  'Kotlin Developer': ['Technology', 'Engineering'],
  'React Developer': ['Technology', 'Frontend'],
};

const LOCATION_CODES = {
  France: 'FR',
  USA: 'US',
  UK: 'UK',
  England: 'UK',
  Germany: 'DE',
  Ireland: 'IE',
  Spain: 'ES',
  Singapore: 'SG',
  Canada: 'CA',
  India: 'IN',
  Netherlands: 'NL',
  Sweden: 'SE',
  Remote: 'RM',
};

const SECTION_LINKS = [
  ['Company Profile', '#company-profile'],
  ['Contact', '#contact'],
  ['Working at Company', '#working-here'],
  ['Team', '#team'],
  ['Benefits', '#benefits'],
  ['Open Positions', '#open-positions'],
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeWebsite(value, companyName) {
  if (value && /^https?:\/\//i.test(value)) return value;
  if (value) return `https://${value}`;
  return `https://${slugify(companyName) || 'company'}.com`;
}

function initials(name) {
  return String(name || 'Company')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function employeeLabel(size) {
  if (!size) return '50+ employees';
  if (size === '1-50') return '11-50 employees';
  if (size === '51-150') return '51-150 employees';
  if (size === '151-250') return '151-250 employees';
  if (size === '251-500') return '251-500 employees';
  if (size === '501-1000') return '501-1000 employees';
  return '1000+ employees';
}

function locationCode(location) {
  const parts = String(location || '').split(',');
  const country = parts[parts.length - 1]?.trim() || location;
  return LOCATION_CODES[country] || 'HQ';
}

function officeSummary(index) {
  if (index === 0) return 'Head Office';
  if (index === 1) return 'Regional Hiring Hub';
  return 'Satellite Office';
}

function buildProfileParagraphs(description, companyName, industry, headOffice) {
  const trimmed = String(description || '').trim();
  const fallbackSecondParagraph = `${companyName} focuses on a candidate experience that is fast, clear, and consistent with how the internal team operates. Hiring managers work in tight feedback loops, and the company invests in collaboration, learning, and strong ownership across every function.`;

  if (!trimmed) {
    return [
      `${companyName} is a ${industry.toLowerCase()} company based in ${headOffice}. The team is building a structured, transparent hiring experience that helps candidates understand the company, the role, and the expectations before they ever speak to a recruiter.`,
      fallbackSecondParagraph,
    ];
  }

  if (trimmed.length > 210) {
    const midpoint = Math.floor(trimmed.length / 2);
    const splitIndex = trimmed.indexOf('.', midpoint);

    if (splitIndex > midpoint - 40) {
      return [
        trimmed.slice(0, splitIndex + 1).trim(),
        trimmed.slice(splitIndex + 1).trim() || fallbackSecondParagraph,
      ];
    }
  }

  return [trimmed, fallbackSecondParagraph];
}

export default function CompanyProfile() {
  const { user } = useAuth();

  const companyName = user?.companyName || user?.company || 'Nomad';
  const discoveryDetails = useMemo(
    () => buildBrowseCompanyDetailsFromJobs(companyName, browseJobs),
    [companyName],
  );

  const baseCompany = useMemo(
    () => companies.find((company) => normalizeText(company.name) === normalizeText(companyName))
      || discoveryDetails.company
      || {},
    [companyName, discoveryDetails.company],
  );

  const officeLocations = useMemo(() => {
    const knownLocations = typeof baseCompany.id === 'number' ? getCompanyOfficeLocations(baseCompany.id) : [];
    const combined = [
      ...knownLocations,
      ...(baseCompany.officeLocations || []),
      ...(user?.location ? [user.location] : []),
    ].filter(Boolean);

    return [...new Set(combined)].slice(0, 5);
  }, [baseCompany.id, baseCompany.officeLocations, user?.location]);

  const officeCards = useMemo(
    () => (officeLocations.length > 0
      ? officeLocations.map((location, index) => ({
          location,
          code: locationCode(location),
          label: officeSummary(index),
        }))
      : [{ location: 'Paris, France', code: 'FR', label: 'Head Office' }]),
    [officeLocations],
  );

  const website = normalizeWebsite(user?.website, companyName);
  const websiteLabel = website.replace(/^https?:\/\//, '');
  const publicProfileHref = `/companies/${getCompanyRouteId({ name: companyName })}`;
  const companyIndustry = user?.industry || baseCompany.industry || 'Technology';
  const companyTags = [...new Set([...(baseCompany.tags || []), companyIndustry])].slice(0, 3);
  const headOffice = officeCards[0]?.location || 'Paris, France';
  const profileParagraphs = buildProfileParagraphs(
    user?.description || baseCompany.description,
    companyName,
    companyIndustry,
    headOffice,
  );

  const openPositions = useMemo(
    () => jobListings
      .filter((job) => job.status === 'Live')
      .slice(0, 4)
      .map((job, index) => ({
        ...job,
        company: companyName,
        location: officeLocations[index % Math.max(officeLocations.length, 1)] || headOffice,
        tags: ROLE_TAGS[job.title] || ['Business', companyIndustry],
      })),
    [companyIndustry, companyName, headOffice, officeLocations],
  );

  const team = teamMembers.slice(0, 3).map((member, index) => ({
    ...member,
    photo: TEAM_PHOTOS[index],
  }));

  const quickFacts = [
    {
      label: 'Open roles',
      value: `${openPositions.length}`,
      icon: BriefcaseIcon,
    },
    {
      label: 'Office locations',
      value: `${officeCards.length}`,
      icon: MapPinIcon,
    },
    {
      label: 'Team leads',
      value: `${team.length}`,
      icon: UserGroupIcon,
    },
  ];

  const socialHandle = `@${slugify(companyName).replace(/-/g, '') || 'company'}`;
  const contactCards = [
    {
      label: 'Website',
      value: websiteLabel,
      href: website,
      icon: GlobeAltIcon,
    },
    {
      label: 'Email',
      value: user?.email || `hello@${slugify(companyName)}.com`,
      href: `mailto:${user?.email || `hello@${slugify(companyName)}.com`}`,
      icon: EnvelopeIcon,
    },
    {
      label: 'LinkedIn',
      value: `linkedin.com/company/${slugify(companyName)}`,
      href: `https://linkedin.com/company/${slugify(companyName)}`,
      icon: ArrowTopRightOnSquareIcon,
    },
    {
      label: 'Head office',
      value: headOffice,
      href: null,
      icon: BuildingOffice2Icon,
    },
  ];

  return (
    <div className="min-h-screen flex-1 bg-[#f6f7fb]">
      <CompanyTopBar
        title="Company Profile"
        subtitle={`${companyName} public profile and hiring details.`}
      />

      <div className="px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-[1180px]">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="relative h-28 overflow-hidden bg-[linear-gradient(135deg,#ebfffb_0%,#dff4ee_48%,#f8fbff_100%)]">
              <div className="absolute -right-8 -top-4 h-24 w-24 rounded-full bg-emerald-200/60 blur-2xl" />
              <div className="absolute left-10 top-4 h-16 w-16 rotate-12 rounded-3xl border border-emerald-200/70 bg-white/70" />
              <div className="absolute left-28 top-9 h-12 w-12 -rotate-12 rounded-2xl border border-teal-200/70 bg-white/70" />
              <div className="absolute right-16 top-8 h-14 w-14 rotate-6 rounded-[20px] border border-sky-200/70 bg-white/80" />
            </div>

            <div className="px-5 pb-5 sm:px-6 lg:px-8">
              <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div
                    className={`${baseCompany.color || 'bg-emerald-500'} flex h-20 w-20 shrink-0 items-center justify-center border-4 border-white text-2xl font-bold text-white shadow-[0_16px_30px_rgba(15,23,42,0.12)]`}
                    style={{ clipPath: 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)' }}
                  >
                    {baseCompany.logo || initials(companyName)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{companyName}</h1>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Hiring
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>{companyIndustry}</span>
                      <span className="text-slate-300">/</span>
                      <span>{headOffice}</span>
                      <span className="text-slate-300">/</span>
                      <span>{employeeLabel(user?.companySize || baseCompany.size)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {companyTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/company/settings"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit profile
                  </Link>
                  <Link
                    to={publicProfileHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Preview page
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid gap-3 sm:grid-cols-3">
                  {quickFacts.map((fact) => {
                    const FactIcon = fact.icon;

                    return (
                      <div key={fact.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <FactIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{fact.value}</p>
                          <p className="text-xs text-slate-500">{fact.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                >
                  {websiteLabel}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              </div>

              <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-4 text-sm">
                {SECTION_LINKS.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    className="whitespace-nowrap border-b-2 border-transparent pb-1 font-medium text-slate-500 transition hover:border-indigo-200 hover:text-slate-900"
                  >
                    {label === 'Working at Company' ? `Working at ${companyName}` : label}
                  </a>
                ))}
              </nav>
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div id="company-profile">
                  <h2 className="text-lg font-semibold text-slate-900">Company Profile</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                    {profileParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div id="contact" className="mt-8 border-t border-slate-200 pt-6">
                  <h3 className="text-base font-semibold text-slate-900">Contact</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {contactCards.map((contact) => {
                      const ContactIcon = contact.icon;

                      return contact.href ? (
                        <a
                          key={contact.label}
                          href={contact.href}
                          target={contact.href.startsWith('http') ? '_blank' : undefined}
                          rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ContactIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{contact.label}</p>
                            <p className="mt-1 truncate text-sm font-medium text-slate-900">{contact.value}</p>
                          </div>
                        </a>
                      ) : (
                        <div
                          key={contact.label}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ContactIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{contact.label}</p>
                            <p className="mt-1 truncate text-sm font-medium text-slate-900">{contact.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section id="working-here" className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Working at {companyName}</h2>
                    <p className="mt-1 text-sm text-slate-500">A quick visual look at the team, space, and collaboration style.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="overflow-hidden rounded-[22px]">
                    <img src={GALLERY_IMAGES[0]} alt={`${companyName} workspace`} className="h-full min-h-[320px] w-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {GALLERY_IMAGES.slice(1).map((image, index) => (
                      <div key={image} className="overflow-hidden rounded-[20px]">
                        <img
                          src={image}
                          alt={`${companyName} team ${index + 1}`}
                          className="h-full min-h-[154px] w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="team" className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900">Team</h2>
                  <span className="text-sm text-slate-500">{team.length} leadership profiles</span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {team.map((member) => (
                    <div key={member.name} className="rounded-[22px] border border-slate-200 px-4 py-5 text-center">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="mx-auto h-16 w-16 rounded-full object-cover"
                      />
                      <p className="mt-4 text-sm font-semibold text-slate-900">{member.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{member.role}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="benefits" className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-900">Benefits</h2>
                  <span className="text-sm text-slate-500">What candidates can expect</span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {BENEFITS.map((benefit) => {
                    const BenefitIcon = benefit.icon;

                    return (
                      <div key={benefit.title} className="rounded-[22px] border border-slate-200 px-4 py-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <BenefitIcon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-900">{benefit.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{benefit.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="open-positions" className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Open Positions</h2>
                    <p className="mt-1 text-sm text-slate-500">Current openings candidates can discover from your company page.</p>
                  </div>
                  <Link to="/company/jobs" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700">
                    View all jobs
                  </Link>
                </div>

                <div className="mt-5 space-y-3">
                  {openPositions.map((job) => (
                    <Link
                      key={job.id}
                      to={`/company/jobs/${job.id}/detail`}
                      className="flex flex-col gap-4 rounded-[22px] border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className={`${job.color} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white`}>
                          {job.title.slice(0, 1)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {job.company} / {job.location}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              {job.jobType}
                            </span>
                            {job.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="text-sm font-semibold text-slate-900">{job.applications.toLocaleString()} applicants</p>
                        <p className="mt-1 text-xs text-slate-500">Posted {job.datePosted}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">Tech Stack</h3>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">6 tools</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {TECH_STACK.map((tech) => (
                    <div
                      key={tech.name}
                      className={`rounded-[18px] border px-3 py-4 text-center ${tech.tone}`}
                    >
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-xs font-semibold shadow-sm">
                        {tech.short}
                      </div>
                      <p className="mt-3 text-[11px] font-semibold leading-4">{tech.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">Office Locations</h3>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{officeCards.length} offices</span>
                </div>

                <div className="mt-5 space-y-4">
                  {officeCards.map((office) => (
                    <div key={`${office.location}-${office.label}`} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                        {office.code}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{office.location}</p>
                        <p className="mt-1 text-xs text-slate-500">{office.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Social</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{socialHandle}</p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
