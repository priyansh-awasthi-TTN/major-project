import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CameraIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import CompanyTopBar from '../../components/CompanyTopBar';
import ApplicantPortrait from '../../components/ApplicantPortrait';
import { getApplicantDetailById } from '../../data/companyApplicantsReference';

const tabs = ['Applicant Profile', 'Resume', 'Hiring Progress', 'Interview Schedule'];

function StageProgressBar({ activeStep, label }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#7c8493]">Stage</span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#5b8def]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5b8def]" />
          {label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={`h-[6px] ${index < activeStep ? 'bg-[#3ea7ff]' : 'bg-[#d6ddeb]'}`}
          />
        ))}
      </div>
    </div>
  );
}

function DetailValue({ label, value }) {
  return (
    <div>
      <p className="text-[12px] text-[#a8adb7]">{label}</p>
      <p className="mt-1 text-[14px] leading-6 text-[#25324b]">{value}</p>
    </div>
  );
}

function ContactRow({ icon, label, value, link = false }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#7c8493]">{icon}</div>
      <div>
        <p className="text-[12px] text-[#a8adb7]">{label}</p>
        <p className={`mt-1 text-[13px] ${link ? 'text-[#5b4ff7]' : 'text-[#25324b]'}`}>{value}</p>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-3 py-4 text-[13px] transition ${
        active ? 'font-medium text-[#25324b]' : 'text-[#7c8493] hover:text-[#25324b]'
      }`}
    >
      {label}
      {active ? <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#5b4ff7]" /> : null}
    </button>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[18px] font-semibold text-[#25324b]">{children}</h3>
      {action}
    </div>
  );
}

function ArrowStage({ label, active, first, last }) {
  return (
    <div
      className={`flex h-11 items-center justify-center px-4 text-[12px] font-medium ${
        active ? 'bg-[#3ea7ff] text-white' : 'bg-[#edf1f8] text-[#7c8493]'
      } ${first ? '' : '-ml-3'}`}
      style={{
        clipPath: first
          ? 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)'
          : last
            ? 'polygon(12% 0, 100% 0, 100% 100%, 12% 100%, 0 50%)'
            : 'polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%)',
      }}
    >
      {label}
    </div>
  );
}

function ResumeView({ detail }) {
  return (
    <div className="bg-white px-4 py-4 sm:px-6 sm:py-6">
      <div className="w-full border border-[#d6ddeb] border-t-[3px] border-t-[#25324b] px-8 py-7 sm:px-10">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h3 className="text-[22px] font-semibold leading-none text-[#25324b]">{detail.applicant.name}</h3>
            <p className="mt-2 text-[13px] text-[#515b6f]">{detail.applicant.profileRole}</p>
          </div>
          <div className="flex items-start gap-6">
            <ApplicantPortrait palette={detail.applicant.avatarPalette} className="h-12 w-12 border border-white shadow-sm" />
            <div className="space-y-1 text-[10px] text-[#a8adb7]">
              <p>{detail.resume.email}</p>
              <p>{detail.resume.phone}</p>
              <p>{detail.resume.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-8 xl:grid-cols-[1.25fr_0.65fr]">
          <div>
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#c3c7d1]">Experience</p>
              <div className="mt-3 space-y-4">
                {detail.resume.experience.map((item) => (
                  <div key={`${item.title}-${item.period}`}>
                    <p className="text-[11px] font-semibold text-[#25324b]">{item.title}</p>
                    <p className="text-[9px] text-[#a8adb7]">{item.company}</p>
                    <p className="text-[9px] text-[#a8adb7]">{item.period}</p>
                    <p className="mt-1 text-[9px] leading-4 text-[#515b6f]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#c3c7d1]">Education</p>
              <div className="mt-3 space-y-4">
                {detail.resume.education.map((item) => (
                  <div key={`${item.title}-${item.period}`}>
                    <p className="text-[11px] font-semibold text-[#25324b]">{item.title}</p>
                    <p className="text-[9px] text-[#a8adb7]">{item.school}</p>
                    <p className="text-[9px] text-[#a8adb7]">{item.period}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {detail.resume.sideGroups.map((group) => (
              <div key={group.title}>
                <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#c3c7d1]">{group.title}</p>
                <div className="mt-2 space-y-1.5">
                  {group.items.map((item) => (
                    <p key={item} className="text-[9px] leading-4 text-[#515b6f]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HiringProgressView({ detail }) {
  const info = detail.hiringProgress;

  return (
    <div className="space-y-6 p-6">
      <SectionTitle
        action={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-[#d6ddeb] px-4 text-[12px] font-semibold text-[#5b4ff7] transition hover:bg-[#f1efff]"
          >
            <ChevronDownIcon className="h-4 w-4" />
            <span>Give Rating</span>
          </button>
        }
      >
        Current Stage
      </SectionTitle>

      <div className="flex flex-wrap items-center">
        {info.stages.map((stage, index) => (
          <ArrowStage
            key={stage}
            label={stage}
            active={stage === info.activeStage}
            first={index === 0}
            last={index === info.stages.length - 1}
          />
        ))}
      </div>

      <div>
        <h4 className="text-[14px] font-semibold text-[#25324b]">Stage Info</h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailValue label="Interview Date" value={info.interviewDate} />
          <div>
            <p className="text-[12px] text-[#a8adb7]">Interview Status</p>
            <span className="mt-1 inline-flex rounded-full bg-[#fff4df] px-2.5 py-1 text-[11px] font-medium text-[#f0b34a]">
              {info.interviewStatus}
            </span>
          </div>
          <DetailValue label="Interview Location" value={info.interviewLocation} />
          <div>
            <p className="text-[12px] text-[#a8adb7]">Assigned to</p>
            <div className="mt-2 flex items-center">
              {info.assignedTo.map((person, index) => (
                <ApplicantPortrait
                  key={person.name}
                  palette={person.palette}
                  className={`h-8 w-8 border border-white shadow-sm ${index === 0 ? '' : '-ml-2'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex h-10 items-center rounded-[2px] border border-[#d6ddeb] px-5 text-[12px] font-semibold text-[#c3c7d1]"
        >
          Move To Next Step
        </button>
      </div>

      <div className="border-t border-[#d6ddeb] pt-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[14px] font-semibold text-[#25324b]">Notes</h4>
          <button type="button" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#5b4ff7]">
            <span className="text-[16px] leading-none">+</span>
            <span>Add Notes</span>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {info.notes.map((note) => (
            <div key={note.id} className="border border-[#d6ddeb] bg-white px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[linear-gradient(180deg,#d9f99d_0%,#65a30d_100%)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] font-semibold text-[#25324b]">{note.author}</p>
                    <p className="text-[11px] text-[#a8adb7]">{note.timestamp}</p>
                  </div>
                  <p className="mt-2 max-w-[520px] text-[13px] leading-6 text-[#515b6f]">{note.body}</p>
                  {note.replies ? <p className="mt-2 text-[12px] font-semibold text-[#5b4ff7]">{note.replies}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InterviewScheduleView({ detail }) {
  return (
    <div className="space-y-6 p-6">
      <SectionTitle
        action={
          <button type="button" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#5b4ff7]">
            <span className="text-[16px] leading-none">+</span>
            <span>Add Schedule Interview</span>
          </button>
        }
      >
        Interview List
      </SectionTitle>

      <div className="space-y-4">
        {detail.interviewSchedule.map((group) => (
          <div key={group.label}>
            <p className="text-[12px] text-[#a8adb7]">{group.label}</p>
            <div className="mt-3 space-y-3">
              {group.items.map((item) => (
                <div key={`${group.label}-${item.name}-${item.type}`} className="border border-[#d6ddeb] bg-white px-4 py-3">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                      <ApplicantPortrait palette={item.palette} className="h-8 w-8 border border-white shadow-sm" />
                      <div>
                        <p className="text-[14px] font-semibold text-[#25324b]">{item.name}</p>
                        <p className="text-[12px] text-[#7c8493]">{item.type}</p>
                      </div>
                    </div>

                    <div className="grid flex-1 gap-2 text-[12px] text-[#515b6f] sm:grid-cols-2 xl:max-w-[420px]">
                      <p className="font-medium text-[#25324b]">{item.time}</p>
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#a8adb7]" />
                        <p>{item.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-[#d6ddeb] px-4 text-[12px] font-semibold text-[#5b4ff7] transition hover:bg-[#f1efff]"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        <span>Add Feedback</span>
                      </button>
                      <button type="button" className="text-[#515b6f] transition hover:text-[#25324b]">
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApplicantProfile() {
  const { id } = useParams();
  const detail = useMemo(() => getApplicantDetailById(id), [id]);
  const [activeTab, setActiveTab] = useState('Applicant Profile');
  const step = detail.summary.stageStep || 3;

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <CompanyTopBar variant="applicants" />

      <div className="px-5 pb-12 pt-[88px] sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <Link to="/company/applicants" className="inline-flex items-center text-[#25324b] transition hover:text-[#5b4ff7]">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-[16px] font-semibold text-[#25324b]">Applicant Details</h1>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-[#d6ddeb] bg-white px-4 text-[12px] font-semibold text-[#5b4ff7] transition hover:bg-[#f1efff]"
            >
              <ChevronDownIcon className="h-4 w-4" />
              <span>More Action</span>
            </button>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[205px_minmax(0,1fr)]">
            <aside className="border border-[#d6ddeb] bg-white p-4">
              <div className="flex items-center gap-3">
                <ApplicantPortrait palette={detail.applicant.avatarPalette} className="h-14 w-14 border border-white shadow-sm" />
                <div>
                  <h2 className="text-[14px] font-semibold text-[#25324b]">{detail.applicant.name}</h2>
                  <p className="mt-1 text-[12px] text-[#a8adb7]">{detail.applicant.profileRole}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <StarIcon className="h-4 w-4 text-[#ffb836]" />
                    <span className="text-[13px] text-[#25324b]">{detail.applicant.scoreLabel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 bg-[#f8f8fd] px-4 py-3">
                <div className="flex items-center justify-between text-[12px] text-[#a8adb7]">
                  <span>Applied Jobs</span>
                  <span>{detail.summary.appliedAgo}</span>
                </div>
                <p className="mt-3 text-[14px] font-semibold text-[#25324b]">{detail.summary.appliedJob}</p>
                <p className="mt-1 text-[12px] text-[#7c8493]">{detail.summary.appliedJobMeta}</p>
              </div>

              <div className="mt-5">
                <StageProgressBar activeStep={step} label={detail.summary.stageLabel} />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-[2px] border border-[#5b4ff7] px-4 py-2.5 text-[12px] font-semibold text-[#5b4ff7] transition hover:bg-[#f1efff]"
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[2px] border border-[#d6ddeb] text-[#5b4ff7] transition hover:bg-[#f8f8fd]"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 border-t border-[#d6ddeb] pt-5">
                <h3 className="text-[14px] font-semibold text-[#25324b]">Contact</h3>
                <div className="mt-4 space-y-4">
                  <ContactRow icon={<EnvelopeIcon className="h-4 w-4" />} label="Email" value={detail.contact.email} />
                  <ContactRow icon={<PhoneIcon className="h-4 w-4" />} label="Phone" value={detail.contact.phone} />
                  <ContactRow icon={<CameraIcon className="h-4 w-4" />} label="Instagram" value={detail.contact.instagram} link />
                  <ContactRow icon={<CameraIcon className="h-4 w-4" />} label="Twitter" value={detail.contact.twitter} link />
                  <ContactRow icon={<GlobeAltIcon className="h-4 w-4" />} label="Website" value={detail.contact.website} link />
                </div>
              </div>
            </aside>

            <section className="border border-[#d6ddeb] bg-white">
              <div className="border-b border-[#d6ddeb]">
                <div className="flex flex-wrap items-center px-3">
                  {tabs.map((tab) => (
                    <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
                  ))}
                </div>
              </div>

              {activeTab === 'Applicant Profile' ? (
                <div className="space-y-6 p-6">
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#25324b]">Personal Info</h3>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <DetailValue label="Full Name" value={detail.personalInfo.fullName} />
                      <DetailValue label="Gender" value={detail.personalInfo.gender} />
                      <DetailValue label="Date of Birth" value={detail.personalInfo.dateOfBirth} />
                      <DetailValue label="Language" value={detail.personalInfo.language} />
                      <div className="md:col-span-2">
                        <DetailValue label="Address" value={detail.personalInfo.address} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#d6ddeb] pt-6">
                    <h3 className="text-[18px] font-semibold text-[#25324b]">Professional Info</h3>
                    <div className="mt-5">
                      <p className="text-[12px] text-[#a8adb7]">About Me</p>
                      <div className="mt-2 space-y-4 text-[14px] leading-7 text-[#515b6f]">
                        {detail.professionalInfo.about.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <DetailValue label="Current Job" value={detail.professionalInfo.currentJob} />
                      <DetailValue label="Experience in Years" value={detail.professionalInfo.experienceYears} />
                      <DetailValue label="Highest Qualification Held" value={detail.professionalInfo.highestQualification} />
                      <div>
                        <p className="text-[12px] text-[#a8adb7]">Skill set</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {detail.professionalInfo.skillSet.map((skill) => (
                            <span key={skill} className="rounded-[2px] bg-[#f1efff] px-2 py-1 text-[11px] font-medium text-[#5b4ff7]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'Resume' ? <ResumeView detail={detail} /> : null}
              {activeTab === 'Hiring Progress' ? <HiringProgressView detail={detail} /> : null}
              {activeTab === 'Interview Schedule' ? <InterviewScheduleView detail={detail} /> : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
