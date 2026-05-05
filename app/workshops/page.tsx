'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { useI18n } from '@/lib/i18n/I18nProvider';
import type { SiteWorkshopDTO } from '@/lib/site-workshop';
import { siteWorkshopDtoToCard, type WorkshopCard } from '@/lib/site-workshop';
import { applyWorkshopAr } from '@/lib/workshops-static-ar';

const STATIC_WORKSHOPS: WorkshopCard[] = [
  { id: 'c1', title: 'Career Compass', instructor: 'Ahmed Al-Mulla', category: 'choice', color: '#fbc02d', letter: 'C', image: '/Picture1.png', details: ['Understanding the choice triangle (Passion, Ability, Opportunity).', 'Self-discovery tools and identifying professional values.', 'Techniques to reduce confusion among multiple options.', "Building a 'flexibility' mindset in the early career path."] },
  { id: 'c2', title: 'Future Map', instructor: 'Sarah Khalid', category: 'choice', color: '#fbc02d', letter: 'C', image: '/Picture2.png', details: ['Reading local and global labor market trends.', 'Identifying required cross-functional Soft Skills.', 'Choosing university programs based on outcomes.', 'Building an early Portfolio before graduation.'] },
  { id: 'c3', title: 'Passion to Plan', instructor: 'Omar Saeed', category: 'choice', color: '#fbc02d', letter: 'C', image: '/Picture1.png', details: ['Converting big dreams into SMART stage goals.', 'Mapping the timeline from study to market.', 'Importance of professional certifications.', 'Research skills for investigating future professions.'] },
  { id: 'c4', title: 'Interest Discovery', instructor: 'Huda Mansour', category: 'choice', color: '#fbc02d', letter: 'C', image: '/Picture1.png', details: ['Applying vocational interest scales (Holland).', 'Differentiating between hobbies and careers.', 'Analyzing personal strengths vs university majors.', 'Practical steps to test majors through volunteering.'] },
  { id: 'c5', title: 'Smart Decision', instructor: 'Decision Lab', category: 'choice', color: '#fbc02d', letter: 'C', image: '/Picture1.png', details: ["Deconstructing the myth of the 'Ideal Major'.", 'Decision-making based on data, not emotions.', 'Managing family and social pressures in choice.', 'Risk assessment in non-traditional paths.'] },
  { id: 'c6', title: 'Public Speaking', instructor: 'Abdullah Hamdan', category: 'choice', color: '#fbc02d', letter: 'C', image: '/Picture1.png', details: ['Mastering professional presence and confidence.', 'Overcoming stage fright and public anxiety.', 'Building persuasive narratives and body language.', 'Vocal tone mastery for professional impact.'] },
  { id: 'a1', title: 'The First 90 Days', instructor: 'HR Specialist', category: 'adapt', color: '#fb8c00', letter: 'A', image: '/Picture1.png', details: ['Psychological preparation for job transition.', 'Building a strong first impression.', 'Understanding unwritten workplace rules.', 'Setting early wins and performance milestones.'] },
  { id: 'a2', title: 'Discipline & Trust', instructor: 'Manager Pro', category: 'adapt', color: '#fb8c00', letter: 'A', image: '/Picture1.png', details: ['Professional reliability and commitment.', 'Managing expectations with supervisors.', 'Time discipline and deadline management.', 'Building a personal brand of consistency.'] },
  { id: 'a3', title: 'Career Path Finance', instructor: 'Finance Coach', category: 'adapt', color: '#fb8c00', letter: 'A', image: '/Picture1.png', details: ['Managing your first salary wisely.', 'Understanding workplace benefits and perks.', 'Personal budgeting for young professionals.', 'Introduction to early-career investment.'] },
  { id: 'a4', title: 'Workplace Etiquette', instructor: 'Soft Skills Team', category: 'adapt', color: '#fb8c00', letter: 'A', image: '/Picture1.png', details: ['Professional communication protocols.', 'Meeting etiquette and active participation.', 'Digital etiquette (Email, Slack, Zoom).', 'Navigating workplace social dynamics.'] },
  { id: 'a5', title: 'Communication Skills', instructor: 'Comms Hub', category: 'adapt', color: '#fb8c00', letter: 'A', image: '/Picture1.png', details: ['Mastering active listening and feedback.', 'Conflict resolution for new professionals.', 'Internal networking and building bridges.', 'Adapting to different management styles.'] },
  { id: 'a6', title: 'Culture Mastery', instructor: 'Culture Expert', category: 'adapt', color: '#fb8c00', letter: 'A', image: '/Picture1.png', details: ['Analyzing organizational culture and values.', 'Adapting to diverse work environments.', 'Understanding team dynamics and roles.', 'Building professional resilience.'] },
  { id: 'r1', title: 'Tasks to Results', instructor: 'Performance Expert', category: 'role', color: '#e53935', letter: 'R', image: '/Picture1.png', details: ['Focusing on impact rather than activity.', 'Mastering core execution of primary duties.', 'Building a reputation for high-quality output.', 'Applying quality standards to daily tasks.'] },
  { id: 'r2', title: 'Professional Reporting', instructor: 'Technical Writer', category: 'role', color: '#e53935', letter: 'R', image: '/Picture1.png', details: ['Communicating value through data-driven reports.', 'Mastering status updates for management.', 'Writing for various professional audiences.', 'Visualization of achievements.'] },
  { id: 'r3', title: 'Reliability Mastery', instructor: 'Ops Manager', category: 'role', color: '#e53935', letter: 'R', image: '/Picture1.png', details: ['Taking full ownership of assigned roles.', "Becoming the 'go-to' person in the team.", 'Managing up: Helping your manager succeed.', 'Consistency in high-pressure scenarios.'] },
  { id: 'r4', title: 'Problem Solving', instructor: 'Analyst Pro', category: 'role', color: '#e53935', letter: 'R', image: '/Picture1.png', details: ['Identifying root causes in workplace issues.', 'Proposing practical, data-backed solutions.', 'Collaborative problem-solving techniques.', 'Resourcefulness under constraints.'] },
  { id: 'r5', title: 'Ownership Mindset', instructor: 'Leadership Lab', category: 'role', color: '#e53935', letter: 'R', image: '/Picture1.png', details: ['Developing a pro-active professional approach.', "Moving from 'Doing' to 'Driving' results.", 'Ethical responsibility in role execution.', 'Building trust through extreme ownership.'] },
  { id: 'r6', title: 'Role Clarity', instructor: 'Consultant X', category: 'role', color: '#e53935', letter: 'R', image: '/Picture1.png', details: ['Defining success in your specific role.', 'Negotiating role boundaries and expectations.', 'Aligning personal goals with job descriptions.', 'Identifying growth areas within the role.'] },
  { id: 'e1', title: 'Performance Impact', instructor: 'Eng. Abdullah Al-Salhoot', category: 'effective', color: '#43a047', letter: 'E', image: '/Picture1.png', details: ['Turning tasks into measurable results (KPIs).', 'Mastering execution with quality and reputation.', 'Strategic problem solving and decision making.', 'Influencing without authority.'] },
  { id: 'e2', title: 'Process Improvement', instructor: 'Lean Specialist', category: 'effective', color: '#43a047', letter: 'E', image: '/Picture1.png', details: ['Optimizing workflows for higher productivity.', 'Using AI tools to boost professional output.', 'Eliminating time-wasters in processes.', 'Continuous improvement (Kaizen) for individuals.'] },
  { id: 'e3', title: 'Analytical Thinking', instructor: 'Strategy Team', category: 'effective', color: '#43a047', letter: 'E', image: '/Picture1.png', details: ['Logical frameworks for professional decisions.', 'Data-backed arguments and presentations.', 'Critical thinking in workplace scenarios.', 'Strategic planning for project success.'] },
  { id: 'e4', title: 'Burnout Prevention', instructor: 'Wellness Hub', category: 'effective', color: '#43a047', letter: 'E', image: '/Picture1.png', details: ['Strategies for professional sustainability.', 'Maintaining high energy levels throughout the day.', 'Work-life integration for long-term growth.', 'Mental resilience in high-pressure roles.'] },
  { id: 'e5', title: 'The 80/20 Rule', instructor: 'Productivity Guru', category: 'effective', color: '#43a047', letter: 'E', image: '/Picture1.png', details: ["Applying Pareto's principle to professional tasks.", 'Identifying high-leverage activities.', "The art of saying 'No' professionally.", 'Managing complex priorities effectively.'] },
  { id: 'e6', title: 'Practical Leadership', instructor: 'Management Team', category: 'effective', color: '#43a047', letter: 'E', image: '/Picture1.png', details: ['Effective delegation and monitoring.', 'Leading small teams and projects.', 'Building a culture of feedback and growth.', 'Conflict management for team leads.'] },
  { id: 'es1', title: 'Strategic Vision', instructor: 'Board Member', category: 'esteem', color: '#039be5', letter: 'E', image: '/Picture1.png', details: ["Contributing to the organization's vision.", 'Developing foresight and long-term planning.', 'Building institutional knowledge systems.', 'Leading high-impact cultural initiatives.'] },
  { id: 'es2', title: 'Experience Transfer', instructor: 'Senior Mentor', category: 'esteem', color: '#039be5', letter: 'E', image: '/Picture1.png', details: ['Mastering the art of mentorship and coaching.', 'Documenting expertise for the organization.', 'Training others and building team capacity.', 'Succession planning from an expert level.'] },
  { id: 'es3', title: 'Trust & Ethics', instructor: 'Ethics Expert', category: 'esteem', color: '#039be5', letter: 'E', image: '/Picture1.png', details: ['Building a brand based on integrity and trust.', 'Managing professional reputation in the industry.', 'Earning and maintaining stakeholder confidence.', 'Ethical leadership at the expert level.'] },
  { id: 'es4', title: 'Niche Authority', instructor: 'Dr. Samer', category: 'esteem', color: '#039be5', letter: 'E', image: '/Picture1.png', details: ['Developing niche expertise and dominance.', 'Becoming a recognized industry authority.', 'Thought leadership and professional publishing.', 'Strategic networking for expert authority.'] },
  { id: 'es5', title: 'Leadership Legacy', instructor: 'CEO Consultant', category: 'esteem', color: '#039be5', letter: 'E', image: '/Picture1.png', details: ['Connecting daily moves to market disruptions.', "Developing a 'C-Suite' strategic mindset.", 'Analyzing industry-wide trends and threats.', 'Long-term professional legacy planning.'] },
  { id: 'es6', title: 'Governance Expert', instructor: 'Legal Advisor', category: 'esteem', color: '#039be5', letter: 'E', image: '/Picture1.png', details: ['Ensuring ethical standards in leadership.', 'Sustainable professional values in practice.', 'Mentoring next-gen leaders on ethics.', 'Compliance and professional honor.'] },
  { id: 'rt1', title: 'New Role Design', instructor: 'Planner Pro', category: 'retire', color: '#3949ab', letter: 'R', image: '/Picture1.png', details: ["Transitioning from 'Position' to 'Personality'.", 'Psychological preparation for job transition.', 'Exploring board member and consultant roles.', 'Designing new life balance (Health & Time).'] },
  { id: 'rt2', title: 'Financial Transition', instructor: 'Wealth Team', category: 'retire', color: '#3949ab', letter: 'R', image: '/Picture1.png', details: ['Portfolio management post-salary.', 'Smart investing in passion projects.', 'Estimating lifestyle costs and securing it.', 'Avoiding financial risks in maturity.'] },
  { id: 'rt3', title: 'The Legacy Project', instructor: 'Philanthropy Expert', category: 'retire', color: '#3949ab', letter: 'R', image: '/Picture1.png', details: ['Establishing community or knowledge endowments.', 'Converting success into social contribution.', 'Building platforms for veteran experts.', 'Entrepreneurial models based on experience.'] },
  { id: 'rt4', title: 'Consulting Art', instructor: 'Independent Advisor', category: 'retire', color: '#3949ab', letter: 'R', image: '/Picture1.png', details: ['Building your model as an independent consultant.', 'Pricing and marketing your expertise.', 'Strategic consulting skills for firms.', 'Working as a part-time expert advisor.'] },
  { id: 'rt5', title: 'Writing Your Story', instructor: 'Author Group', category: 'retire', color: '#3949ab', letter: 'R', image: '/Picture1.png', details: ['Documenting your career autobiography.', 'Writing industry-specific lessons.', "Creating a 'Knowledge Bank' for the future.", 'Storytelling your professional journey.'] },
  { id: 'rt6', title: 'Art of Mentorship', instructor: 'Veteran Coach', category: 'retire', color: '#3949ab', letter: 'R', image: '/Picture1.png', details: ['Transferring wisdom to the next generation.', 'Ensuring professional continuity.', 'Building mentoring relationships.', 'Legacy through leadership development.'] },
];

type DayBucket = number | 'other';

export default function WorkshopsPage() {
  const { locale, t } = useI18n();
  const tw = t('workshops');

  const [remoteDtos, setRemoteDtos] = useState<SiteWorkshopDTO[] | null>(null);
  const [filter, setFilter] = useState('ALL');

  // read ?category= from URL on mount
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    const valid = ['choice','adapt','role','effective','esteem','retire']
    if (cat && valid.includes(cat)) setFilter(cat)
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/site-workshops')
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setRemoteDtos(data as SiteWorkshopDTO[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const workshopsList = useMemo(() => {
    if (remoteDtos && remoteDtos.length > 0) {
      return remoteDtos.map((d) => siteWorkshopDtoToCard(d, locale));
    }
    return applyWorkshopAr(STATIC_WORKSHOPS, locale);
  }, [remoteDtos, locale]);

  const menuItems = useMemo(
    () => [
      { label: tw.filterAll, id: 'ALL', color: '#1e293b' },
      { label: 'C', id: 'choice', color: '#fbc02d' },
      { label: 'A', id: 'adapt', color: '#fb8c00' },
      { label: 'R', id: 'role', color: '#e53935' },
      { label: 'E', id: 'effective', color: '#43a047' },
      { label: 'E', id: 'esteem', color: '#039be5' },
      { label: 'R', id: 'retire', color: '#3949ab' },
    ],
    [tw.filterAll],
  );

  const filteredWorkshops = useMemo(() => {
    return filter === 'ALL' ? workshopsList : workshopsList.filter((ws) => ws.category === filter);
  }, [workshopsList, filter]);

  const useDaySections = useMemo(() => {
    return filteredWorkshops.some(
      (w) => w.dayOfWeek != null && w.dayOfWeek >= 0 && w.dayOfWeek <= 6,
    );
  }, [filteredWorkshops]);

  const sections = useMemo(() => {
    if (!useDaySections) return null;
    const map = new Map<DayBucket, WorkshopCard[]>();
    for (const w of filteredWorkshops) {
      const bucket: DayBucket =
        w.dayOfWeek != null && w.dayOfWeek >= 0 && w.dayOfWeek <= 6 ? w.dayOfWeek : 'other';
      const list = map.get(bucket) ?? [];
      list.push(w);
      map.set(bucket, list);
    }
    const order: DayBucket[] = [0, 1, 2, 3, 4, 5, 6, 'other'];
    return order.filter((k) => map.has(k)).map((k) => ({ key: k, items: map.get(k)! }));
  }, [filteredWorkshops, useDaySections]);

  const dayLabel = (k: DayBucket) => {
    if (k === 'other') return tw.daySectionOther;
    return tw.dayNames[k] ?? '';
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
    maxWidth: '1300px',
    margin: '0 auto',
  };

  const renderCard = (ws: WorkshopCard) => (
    <div
      key={ws.id}
      onMouseEnter={() => setHoveredId(ws.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow:
          hoveredId === ws.id ? '0 20px 25px -5px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
        borderTop: `8px solid ${ws.color}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s ease',
        transform: hoveredId === ws.id ? 'translateY(-8px)' : 'none',
      }}
    >
      <div style={{ width: '100%', height: '180px', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        <img
          src={ws.image}
          alt={ws.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: hoveredId === ws.id ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '15px',
            insetInlineEnd: '20px',
            color: ws.color,
            opacity: 0.2,
            fontWeight: 900,
            fontSize: '3.5rem',
            pointerEvents: 'none',
          }}
        >
          {ws.letter}
        </div>
      </div>

      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>{ws.title}</h2>
        <p
          style={{
            color: ws.color,
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}
        >
          {ws.instructor}
        </p>

        <div
          style={{
            maxHeight: hoveredId === ws.id ? '400px' : '0px',
            opacity: hoveredId === ws.id ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            marginTop: hoveredId === ws.id ? '15px' : '0px',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {ws.details.map((detail, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  color: '#64748b',
                  fontSize: '0.88rem',
                  marginBottom: '10px',
                  lineHeight: '1.5',
                }}
              >
                <CheckCircle2 size={16} style={{ color: ws.color, flexShrink: 0, marginTop: '2px' }} />
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedWorkshop(ws.title);
            setIsModalOpen(true);
            setSubmitted(false);
          }}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '14px',
            background: ws.color,
            color: 'white',
            border: 'none',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '20px',
            boxShadow: `0 8px 20px ${ws.color}33`,
            transition: '0.3s ease',
          }}
        >
          {tw.registerNow}
        </button>
      </div>
    </div>
  );

  return (
    <main
      style={{
        padding: '60px 20px',
        background: '#f1f5f9',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '25px',
            letterSpacing: '-1px',
          }}
        >
          {tw.pageTitle}
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              style={{
                padding: '12px 26px',
                borderRadius: '100px',
                border: `2px solid ${item.color}`,
                background: filter === item.id ? item.color : 'white',
                color: filter === item.id ? 'white' : item.color,
                cursor: 'pointer',
                fontWeight: 800,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: filter === item.id ? `0 10px 15px -3px ${item.color}44` : 'none',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {sections ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {sections.map((section) => (
            <section key={String(section.key)}>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '20px',
                  maxWidth: '1300px',
                  marginInline: 'auto',
                  textAlign: 'start',
                  paddingInline: '4px',
                }}
              >
                {dayLabel(section.key)}
              </h2>
              <div style={gridStyle}>{section.items.map(renderCard)}</div>
            </section>
          ))}
        </div>
      ) : (
        <div style={gridStyle}>{filteredWorkshops.map(renderCard)}</div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15,23,42,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '30px',
              width: '90%',
              maxWidth: '480px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              style={{
                position: 'absolute',
                insetInlineEnd: '25px',
                top: '20px',
                cursor: 'pointer',
                fontSize: '32px',
                color: '#94a3b8',
              }}
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </span>
            {!submitted ? (
              <form
                action="https://docs.google.com/forms/d/e/1FAIpQLSeQxLhtBb_J2Fq03MXTVoA5Dzp5f1nctoR9-7t6j4LTFNGlSg/formResponse"
                method="post"
                target="hidden_iframe"
                onSubmit={() => setSubmitted(true)}
              >
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '10px', color: '#0f172a' }}>
                  {tw.reserveTitle}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '30px' }}>
                  {tw.workshopLabel} <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedWorkshop}</span>
                </p>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#1e293b' }}>
                    {tw.fullName}
                  </label>
                  <input
                    name="entry.1706347372"
                    required
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #f1f5f9',
                      borderRadius: '15px',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                    placeholder={tw.fullNamePlaceholder}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                  }}
                >
                  {tw.confirmRegistration}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>⭐</div>
                <h2 style={{ fontWeight: 900, color: '#0f172a', fontSize: '2rem' }}>{tw.successTitle}</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '10px' }}>
                  {tw.successBody.replace('{title}', selectedWorkshop)}
                </p>
              </div>
            )}
            <iframe name="hidden_iframe" style={{ display: 'none' }} title="Form submit"></iframe>
          </div>
        </div>
      )}
    </main>
  );
}
