import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { ArrowDown, ArrowUpRight, Check, ChevronRight, HandHeart, Menu, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import {
  MENTOR_EXPERIENCE_RANGES,
  MENTOR_FIELDS,
  MENTOR_HELP_OPTIONS,
  saveMentorSignup,
  submitMentorSignup,
  type MentorSignupInput,
} from '@/mentor-signup-form';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type RevealProps = { children: ReactNode; className?: string; delay?: 1 | 2 | 3 };

function Reveal({ children, className = '', delay }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.14 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${delay ? `reveal-delay-${delay}` : ''} ${className}`}>{children}</div>;
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="focus-ring inline-flex items-center gap-3" data-testid="link-wordmark">
      <img src="/guftagoo-mark.png" alt="Guftagoo Urdu wordmark" className={`${compact ? 'h-16 w-16' : 'h-16 w-16'} object-contain`} />
      <span className="font-mono text-[11px] font-bold tracking-[.22em] text-[#1c214a]">GUFTAGOO</span>
    </a>
  );
}

function SignupModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [field, setField] = useState<MentorSignupInput['field'] | ''>('');
  const [yearsExperience, setYearsExperience] = useState<MentorSignupInput['yearsExperience'] | ''>('');
  const [helpOptions, setHelpOptions] = useState<MentorSignupInput['helpOptions']>([]);
  const [error, setError] = useState('');
  const signupMutation = useMutation({
    mutationFn: ({ data }: { data: MentorSignupInput }) => saveMentorSignup(supabase, data),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    submitMentorSignup({
      event,
      values: {
        name,
        email,
        field,
        yearsExperience,
        helpOptions,
      },
      mutation: signupMutation,
      setError,
      setSubmitted,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c214a]/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="relative w-full max-w-[540px] overflow-hidden rounded-[28px] bg-[#f9f5eb] p-7 shadow-2xl sm:p-10">
        <button onClick={onClose} className="focus-ring absolute right-5 top-5 rounded-full p-2 text-[#1c214a]/60 transition hover:bg-[#1c214a]/8 hover:text-[#1c214a]" aria-label="Close signup" data-testid="button-close-signup"><X size={20} /></button>
        {!submitted ? (
          <>
            <div className="mb-8 max-w-sm">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#1d9fb6]">A small first step</span>
              <h2 id="signup-title" className="mt-3 font-serif text-[42px] leading-[.95] text-[#1c214a]">Bring what you know.</h2>
              <p className="mt-4 text-[15px] leading-6 text-[#52536a]">Tell us a little about yourself. We’ll be in touch when we’re ready to make a thoughtful match.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#52536a]">Your name</span>
                <input required value={name} onChange={(event) => setName(event.target.value)} className="focus-ring w-full rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-4 py-3.5 text-[#1c214a] outline-none transition placeholder:text-[#a5a0a0] focus:border-[#1d9fb6]" placeholder="What should we call you?" data-testid="input-mentor-name" />
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#52536a]">Email address</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring w-full rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-4 py-3.5 text-[#1c214a] outline-none transition placeholder:text-[#a5a0a0] focus:border-[#1d9fb6]" placeholder="you@example.com" data-testid="input-mentor-email" />
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#52536a]">Your field</span>
                <select required value={field} onChange={(event) => setField(event.target.value as MentorSignupInput['field'])} className="focus-ring w-full appearance-none rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-4 py-3.5 text-[#1c214a] outline-none transition focus:border-[#1d9fb6]" data-testid="select-mentor-field">
                  <option value="" disabled>Choose your field</option>
                  {MENTOR_FIELDS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#52536a]">Years of experience</span>
                <select required value={yearsExperience} onChange={(event) => setYearsExperience(event.target.value as MentorSignupInput['yearsExperience'])} className="focus-ring w-full appearance-none rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-4 py-3.5 text-[#1c214a] outline-none transition focus:border-[#1d9fb6]" data-testid="select-mentor-experience">
                  <option value="" disabled>Choose a range</option>
                  {MENTOR_EXPERIENCE_RANGES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <fieldset className="block">
                <legend className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#52536a]">How would you like to help?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {MENTOR_HELP_OPTIONS.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[#d9d5ca] bg-[#fffdf8] px-3.5 py-3 text-sm text-[#1c214a] transition hover:border-[#1d9fb6] has-[:checked]:border-[#1d9fb6] has-[:checked]:bg-[#e7f5f2]">
                      <input
                        type="checkbox"
                        name="help"
                        value={option}
                        checked={helpOptions.includes(option)}
                        onChange={(event) => setHelpOptions((current) => event.target.checked ? [...current, option] : current.filter((item) => item !== option))}
                        className="h-4 w-4 accent-[#1d9fb6]"
                        data-testid={`checkbox-help-${option.toLowerCase().replace(' ', '-')}`}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {error && <p className="rounded-xl border border-[#c86a62]/35 bg-[#fff0ec] px-4 py-3 text-sm leading-5 text-[#9d4038]" role="alert" data-testid="text-signup-error">{error}</p>}
              <button type="submit" disabled={signupMutation.isPending} className="focus-ring mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#1c214a] px-5 py-4 font-semibold text-[#f9f5eb] transition hover:-translate-y-0.5 hover:bg-[#252b60] disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-signup">{signupMutation.isPending ? 'Saving your place…' : 'Join the mentor list'} {!signupMutation.isPending && <ArrowUpRight size={17} />}</button>
            </form>
            <p className="mt-5 text-center text-xs leading-5 text-[#777487]">No sales pitch. Just a real conversation when the time is right.</p>
          </>
        ) : (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#bfe9e7] text-[#1c214a]"><Check size={28} strokeWidth={2.5} /></div>
            <h2 className="mt-7 font-serif text-[44px] leading-none text-[#1c214a]">You’re on the list.</h2>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-6 text-[#52536a]">Thank you, {name || 'friend'}. The best conversations start with showing up.</p>
            <button onClick={onClose} className="focus-ring mt-8 rounded-full border border-[#1c214a] px-6 py-3 text-sm font-semibold text-[#1c214a] transition hover:bg-[#1c214a] hover:text-[#f9f5eb]" data-testid="button-finish-signup">Back to Guftagoo</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  function openSignup() {
    setSignupOpen(true);
    setMenuOpen(false);
  }

  return (
    <main id="top" className="grain overflow-hidden bg-[#f9f5eb] text-[#1c214a]">
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5 lg:px-10 lg:py-7">
          <Wordmark compact />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <a href="#why" className="focus-ring text-sm text-[#52536a] transition hover:text-[#1c214a]" data-testid="link-nav-why">Why Guftagoo</a>
            <a href="#how" className="focus-ring text-sm text-[#52536a] transition hover:text-[#1c214a]" data-testid="link-nav-how">How it works</a>
            <button onClick={openSignup} className="focus-ring rounded-full bg-[#1c214a] px-5 py-2.5 text-sm font-semibold text-[#f9f5eb] transition hover:-translate-y-0.5 hover:bg-[#252b60]" data-testid="button-nav-signup">Sign up as a Mentor <ArrowUpRight className="ml-1 inline" size={15} /></button>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring rounded-full p-2 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
        {menuOpen && (
          <div className="mx-4 rounded-2xl border border-[#d9d5ca] bg-[#fffdf8] p-3 shadow-lg md:hidden">
            <a href="#why" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#52536a] hover:bg-[#f1ede3]" data-testid="link-mobile-why">Why Guftagoo</a>
            <a href="#how" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#52536a] hover:bg-[#f1ede3]" data-testid="link-mobile-how">How it works</a>
            <button onClick={openSignup} className="mt-1 w-full rounded-xl bg-[#1c214a] px-4 py-3 text-left text-sm font-semibold text-[#f9f5eb]" data-testid="button-mobile-signup">Sign up as a Mentor <ArrowUpRight className="ml-1 inline" size={15} /></button>
          </div>
        )}
      </header>

      <section className="relative min-h-[770px] overflow-hidden px-6 pb-20 pt-36 lg:min-h-[820px] lg:px-10 lg:pt-48">
        <div className="absolute right-[-130px] top-[90px] h-[520px] w-[520px] rounded-full bg-[#bfe9e7]/65 blur-[1px] lg:right-[-70px] lg:top-[35px] lg:h-[680px] lg:w-[680px]" />
        <div className="absolute bottom-[12%] left-[-80px] h-52 w-52 rounded-full bg-[#f5ba52]/30 blur-[2px]" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[1.03fr_.97fr] lg:gap-20">
          <div className="max-w-[700px]">
            <div className="animate-rise inline-flex items-center gap-3 rounded-full border border-[#1d9fb6]/35 bg-[#e7f5f2] px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[.15em] text-[#187e93]">
              <span className="h-2 w-2 rounded-full bg-[#1d9fb6]" /> A community built on generosity
            </div>
            <h1 className="animate-rise mt-7 max-w-3xl font-serif text-[clamp(4rem,9vw,8.5rem)] leading-[.83] tracking-[-.045em] text-[#1c214a] [animation-delay:100ms]">
              Your next<br /><em className="text-[#1d9fb6]">conversation</em><br />could change a life.
            </h1>
            <p className="animate-rise mt-8 max-w-[500px] text-[17px] leading-7 text-[#52536a] [animation-delay:220ms] sm:text-[19px] sm:leading-8">
              Guftagoo connects experienced Pakistanis with people finding their way into the careers they’ve been dreaming about.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap items-center gap-5 [animation-delay:340ms]">
              <button onClick={openSignup} className="focus-ring group inline-flex items-center gap-3 rounded-full bg-[#1c214a] px-6 py-4 text-[15px] font-semibold text-[#f9f5eb] shadow-[0_12px_30px_rgba(28,33,74,.15)] transition hover:-translate-y-1 hover:bg-[#252b60]" data-testid="button-hero-signup">
                Sign up as a Mentor <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5ba52] text-[#1c214a] transition group-hover:rotate-45"><ArrowUpRight size={15} /></span>
              </button>
              <a href="#how" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-[#1c214a] transition hover:gap-3" data-testid="link-hero-how">See how it works <ArrowDown size={16} /></a>
            </div>
          </div>
          <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[500px]">
            <div className="animate-drift relative z-10 w-[min(78vw,400px)] rotate-[3deg] rounded-[32px] bg-[#27b0c7] p-3 shadow-[18px_24px_0_#1c214a]">
              <img src="/guftagoo-mark.png" alt="Guftagoo wordmark in Urdu and English" className="w-full rounded-[24px]" />
              <div className="absolute -bottom-8 -left-10 rounded-[18px] border border-[#d9d5ca] bg-[#fffdf8] px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5ba52]"><HandHeart size={16} /></span><span className="font-mono text-[10px] font-bold uppercase tracking-[.1em]">Give what you know</span></div>
              </div>
            </div>
            <div className="absolute right-[3%] top-[6%] z-0 flex h-24 w-24 rotate-12 items-center justify-center rounded-full bg-[#f5ba52] text-center font-serif text-[19px] leading-[.9] text-[#1c214a] shadow-lg lg:right-[8%]">make<br />room</div>
            <div className="absolute bottom-[2%] left-[5%] font-mono text-[10px] uppercase tracking-[.22em] text-[#52536a]/70 lg:left-[12%]">Lahore · Karachi · Islamabad · everywhere</div>
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 font-mono text-[10px] uppercase tracking-[.18em] text-[#52536a]/70 sm:flex">Scroll to begin <span className="h-8 w-px bg-[#52536a]/30" /></div>
      </section>

      <section id="why" className="relative border-t border-[#d9d5ca] bg-[#1c214a] px-6 py-24 text-[#f9f5eb] lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.66fr_1.34fr] lg:gap-24">
          <Reveal>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#f5ba52]">Why this exists</span>
            <div className="mt-8 h-px w-24 bg-[#1d9fb6] draw-line" />
            <p className="mt-7 max-w-[270px] text-sm leading-6 text-[#b4b5c7]">Because a closed door is often just a missing introduction.</p>
          </Reveal>
          <Reveal delay={1}>
            <blockquote className="max-w-[830px] font-serif text-[clamp(2.5rem,5.5vw,5.7rem)] leading-[.94] tracking-[-.025em]">
              “Someone once made space for me at the table. <em className="text-[#55c8cb]">Guftagoo is how we pass the chair on.</em>”
            </blockquote>
            <div className="mt-10 flex items-center gap-3 text-sm text-[#b4b5c7]"><span className="h-px w-8 bg-[#f5ba52]" /> A simple idea, shared by people who remember starting out</div>
          </Reveal>
        </div>
      </section>

      <section id="how" className="border-t border-[#d9d5ca] bg-[#e7f5f2] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div><span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#187e93]">How it works</span><h2 className="mt-5 max-w-[610px] font-serif text-[clamp(3.5rem,7vw,7.2rem)] leading-[.82] tracking-[-.045em] text-[#1c214a]">Four steps.<br /><em>One ripple.</em></h2></div>
              <p className="max-w-[270px] text-[15px] leading-6 text-[#52536a]">No complicated platform. Just people, matched with care.</p>
            </div>
          </Reveal>
          <div className="relative mt-20 grid gap-10 md:grid-cols-4 md:gap-5">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-[#9bcfce] md:block" />
            {[
              ['01', 'Sign up', 'Tell us what you know, and who you’d love to help.'],
              ['02', 'Get verified', 'A quick check keeps every conversation grounded in trust.'],
              ['03', 'Get matched', 'We’ll find someone whose next step meets your experience.'],
              ['04', 'Give back', 'Make time for a conversation. Watch it travel further.'],
            ].map(([num, title, text], index) => (
              <Reveal key={num} delay={(index + 1) as 1 | 2 | 3}>
                <article className="relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1d9fb6] bg-[#e7f5f2] font-mono text-sm font-bold text-[#187e93] transition duration-300 hover:-translate-y-1 hover:bg-[#1d9fb6] hover:text-[#f9f5eb]">{num}</div>
                  <h3 className="mt-7 font-serif text-[30px] leading-none text-[#1c214a]">{title}</h3>
                  <p className="mt-4 max-w-[220px] text-[15px] leading-6 text-[#52536a]">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <button onClick={openSignup} className="focus-ring group inline-flex items-center gap-3 rounded-full bg-[#1c214a] px-6 py-4 text-[15px] font-semibold text-[#f9f5eb] transition hover:-translate-y-1 hover:bg-[#252b60]" data-testid="button-how-signup">Sign up as a Mentor <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5ba52] transition group-hover:rotate-45"><ArrowUpRight size={15} /></span></button>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f5ba52] px-6 py-24 lg:px-10 lg:py-32">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[32px] border-[#f9f5eb]/30" />
        <div className="absolute -bottom-24 left-[15%] h-56 w-56 rounded-full border-[22px] border-[#1d9fb6]/20" />
        <div className="relative mx-auto flex max-w-[1240px] flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <Reveal>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#1c214a]/65">Your seat is waiting</span>
            <h2 className="mt-6 max-w-[780px] font-serif text-[clamp(3.8rem,8vw,8rem)] leading-[.8] tracking-[-.045em] text-[#1c214a]">Have a little<br /><em>guftagoo.</em></h2>
          </Reveal>
          <Reveal delay={1} className="max-w-[340px]">
            <p className="text-[17px] leading-7 text-[#1c214a]/75">The best thing you can give someone at the beginning is proof that they belong in the room.</p>
            <button onClick={openSignup} className="focus-ring mt-7 inline-flex items-center gap-3 rounded-full bg-[#1c214a] px-6 py-4 text-[15px] font-semibold text-[#f9f5eb] transition hover:-translate-y-1 hover:bg-[#252b60]" data-testid="button-closing-signup">Sign up as a Mentor <ArrowUpRight size={17} /></button>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#1c214a] px-6 py-12 text-[#f9f5eb] lg:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-10 sm:flex-row sm:items-end">
          <div><Wordmark compact /><p className="mt-5 max-w-[250px] text-sm leading-6 text-[#b4b5c7]">Conversations that make room for what’s next.</p></div>
          <div className="flex flex-col gap-3 sm:items-end"><a href="#top" className="focus-ring inline-flex items-center gap-2 text-sm text-[#b4b5c7] transition hover:text-[#f9f5eb]" data-testid="link-back-top">Back to top <ChevronRight size={16} className="-rotate-90" /></a><span className="font-mono text-[10px] uppercase tracking-[.17em] text-[#777b9a]">Made for Pakistanis, everywhere</span></div>
        </div>
      </footer>

      {signupOpen && <SignupModal onClose={() => setSignupOpen(false)} />}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;