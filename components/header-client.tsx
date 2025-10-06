'use client'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import React from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { Menu, X, Shield, SquareActivity, Sparkles, Cpu, Gem, ShoppingBag, BookOpen, Notebook, Smartphone, Rocket, Cloud, Bot } from 'lucide-react'
import { useMedia } from '@/hooks/use-media'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface HeaderUser {
    id: string
    name: string | null
    email: string | null
}

interface HeaderProps {
    user?: HeaderUser | null
}

interface FeatureLink {
    href: string
    name: string
    description?: string
    icon: React.ReactElement
}

interface MobileLink {
    groupName?: string
    links?: FeatureLink[]
    name?: string
    href?: string
}

const features: FeatureLink[] = [
    {
        href: '#builder',
        name: 'Kampanjebygger',
        description: 'Lanser merkevaretilpassede kalendere uten kode – på hvilket som helst språk.',
        icon: <Sparkles className="stroke-foreground fill-green-500/15" />,
    },
    {
        href: '#automation',
        name: 'Automatisering',
        description: 'Planlegg påminnelser, premier og oppfølging automatisk.',
        icon: <Bot className="stroke-foreground fill-yellow-500/15" />,
    },
    {
        href: '#compliance',
        name: 'Etterlevelse',
        description: 'Samle GDPR-klare samtykker og behold revisjonsspor.',
        icon: <Shield className="stroke-foreground fill-blue-500/15" />,
    },
]

const moreFeatures: FeatureLink[] = [
    {
        href: '#integrations',
        name: 'Integrasjoner',
        description: 'Synkroniser leads sømløst med CRM, ESP og annonseplattformer.',
        icon: <Cpu className="stroke-foreground fill-blue-500/15" />,
    },
    {
        href: '#analytics',
        name: 'Innsikt',
        description: 'Mål konverteringer, ROI og premier i sanntid.',
        icon: <SquareActivity className="stroke-foreground fill-indigo-500/15" />,
    },
    {
        href: '#prizing',
        name: 'Premieadministrasjon',
        description: 'Administrer giveaways med automatiske trekninger og logger.',
        icon: <Gem className="stroke-foreground fill-pink-500/15" />,
    },
    {
        href: '#messaging',
        name: 'E-post og SMS',
        description: 'Send merkevaretilpassede påminnelser og daglige oppdateringer.',
        icon: <Smartphone className="stroke-foreground fill-zinc-500/15" />,
    },
    {
        href: '#scaling',
        name: 'Skalerbarhet',
        description: 'Håndter trafikk-topper med gjennomtestet infrastruktur.',
        icon: <Rocket className="stroke-foreground fill-orange-500/15" />,
    },
    {
        href: '#support',
        name: 'Suksessteam',
        description: 'Få hjelp av kampanjeeksperter til å nå målene dine.',
        icon: <Cloud className="stroke-foreground fill-teal-500/15" />,
    },
]

const useCases: FeatureLink[] = [
    {
        href: '#retail',
        name: 'Detaljhandel og D2C',
        description: 'Øk butikkbesøk og netthandel med daglige tilbud.',
        icon: <ShoppingBag className="stroke-foreground fill-emerald-500/25" />,
    },
    {
        href: '#media',
        name: 'Media og underholdning',
        description: 'Øk streaming-engasjement med eksklusive premier og innhold.',
        icon: <Sparkles className="stroke-foreground fill-green-500/15" />,
    },
    {
        href: '#hospitality',
        name: 'Reise og hospitality',
        description: 'Fyll rom og bord med tidsavgrensede sesongopplevelser.',
        icon: <Gem className="stroke-foreground fill-pink-500/15" />,
    },
    {
        href: '#b2b',
        name: 'B2B og SaaS',
        description: 'Nurtur leads med læring, premier og automatisert oppfølging.',
        icon: <Notebook className="stroke-foreground fill-zinc-500/15" />,
    },
]

const contentLinks: FeatureLink[] = [
    { name: 'Guide for høytidskampanjer', href: '#link', icon: <BookOpen className="stroke-foreground fill-purple-500/15" /> },
    { name: 'Spillebøker og maler', href: '#link', icon: <Notebook className="stroke-foreground fill-zinc-500/15" /> },
    { name: 'Kundehistorier', href: '#link', icon: <SquareActivity className="stroke-foreground fill-indigo-500/15" /> },
]

const mobileLinks: MobileLink[] = [
    {
        groupName: 'Plattform',
        links: features,
    },
    {
        groupName: 'Løsninger',
        links: [...useCases, ...contentLinks],
    },
    { name: 'Priser', href: '#' },
    { name: 'Ressurser', href: '#' },
]

export default function Header({ user }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const isLarge = useMedia('(min-width: 64rem)')

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    React.useEffect(() => {
        const originalOverflow = document.body.style.overflow

        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [isMobileMenuOpen])

    return (
        <header
            role="banner"
            data-state={isMobileMenuOpen ? 'active' : 'inactive'}
            {...(isScrolled && { 'data-scrolled': true })}
            className="fixed inset-x-0 top-0 z-50">
            <div className={cn('border-foregroud/5 absolute inset-x-0 top-0 z-50 transition-all duration-300', 'in-data-scrolled:border-b in-data-scrolled:bg-background/75 in-data-scrolled:backdrop-blur', !isLarge && 'h-14 overflow-hidden border-b', isMobileMenuOpen && 'bg-background/75 h-screen backdrop-blur')}>
                <div className="mx-auto max-w-6xl px-6 lg:px-12">
                    <div className="relative flex flex-wrap items-center justify-between lg:py-5">
                        <div className="max-lg:border-foreground/5 flex justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen == true ? 'Lukk meny' : 'Åpne meny'}
                                className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-5 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        {isLarge && (
                            <div className="absolute inset-0 m-auto size-fit">
                                <NavMenu />
                            </div>
                        )}
                        {!isLarge && isMobileMenuOpen && <MobileMenu user={user ?? null} closeMenu={() => setIsMobileMenuOpen(false)} />}

                        <div className="max-lg:in-data-[state=active]:mt-6 in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                {user ? (
                                    <Button
                                        asChild
                                        size="sm">
                                        <Link href="/dashboard">
                                            <span>Gå til dashbord</span>
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm">
                                            <Link href="/sign-in">
                                                <span>Logg inn</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="sm">
                                            <Link href="/sign-up">
                                                <span>Kom i gang</span>
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

const MobileMenu = ({ closeMenu, user }: { closeMenu: () => void; user: HeaderUser | null }) => {
    return (
        <nav
            role="navigation"
            className="w-full [--color-muted:--alpha(var(--color-foreground)/5%)]">
            <Accordion
                type="single"
                collapsible
                className="**:hover:no-underline -mx-4 mt-0.5 space-y-0.5">
                {mobileLinks.map((link, index) => {
                    if (link.groupName && link.links) {
                        return (
                            <AccordionItem
                                key={index}
                                value={link.groupName}
                                className="group relative border-b-0">
                                <AccordionTrigger className="**:!font-normal data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg">{link.groupName}</AccordionTrigger>
                                <AccordionContent className="pb-5">
                                    <ul>
                                        {link.links.map((feature, featureIndex) => (
                                            <li key={featureIndex}>
                                                <Link
                                                    href={feature.href}
                                                    onClick={closeMenu}
                                                    className="grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2">
                                                    <div
                                                        aria-hidden
                                                        className="flex items-center justify-center *:size-4">
                                                        {feature.icon}
                                                    </div>
                                                    <div className="text-base">{feature.name}</div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    }
                    return null
                })}
            </Accordion>
            {mobileLinks.map((link, index) => {
                if (link.name && link.href) {
                    return (
                        <Link
                            key={index}
                            href={link.href}
                            onClick={closeMenu}
                            className="group relative block py-4 text-lg">
                            {link.name}
                        </Link>
                    )
                }
                return null
            })}
            <div className="mt-6 flex flex-col gap-3">
                {user ? (
                    <Button asChild>
                        <Link href="/dashboard" onClick={closeMenu}>
                            Gå til dashbord
                        </Link>
                    </Button>
                ) : (
                    <>
                        <Button
                            asChild
                            variant="outline">
                            <Link href="/sign-in" onClick={closeMenu}>
                                Logg inn
                            </Link>
                        </Button>
                        <Button
                            asChild>
                            <Link href="/sign-up" onClick={closeMenu}>
                                Kom i gang
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    )
}

const NavMenu = () => {
    return (
        <NavigationMenu className="**:data-[slot=navigation-menu-viewport]:bg-[color-mix(in_oklch,var(--color-muted)_25%,var(--color-background))] **:data-[slot=navigation-menu-viewport]:shadow-lg **:data-[slot=navigation-menu-viewport]:rounded-2xl **:data-[slot=navigation-menu-viewport]:top-4 [--color-muted:color-mix(in_oklch,var(--color-foreground)_5%,transparent)] [--viewport-outer-px:2rem] max-lg:hidden">
            <NavigationMenuList className="gap-3">
                <NavigationMenuItem value="product">
                    <NavigationMenuTrigger>Plattform</NavigationMenuTrigger>
                    <NavigationMenuContent className="origin-top pb-1.5 pl-1 pr-4 pt-1 backdrop-blur">
                        <div className="min-w-6xl pr-18.5 grid w-full grid-cols-4 gap-1">
                            <div className="bg-card row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                                <span className="text-muted-foreground ml-2 text-xs">Funksjoner</span>
                                <ul>
                                    {features.map((feature, index) => (
                                        <ListItem
                                            key={index}
                                            href={feature.href}
                                            title={feature.name}
                                            description={feature.description}>
                                            {feature.icon}
                                        </ListItem>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-card col-span-2 row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                                <span className="text-muted-foreground ml-2 text-xs">Flere funksjoner</span>
                                <ul className="grid grid-cols-2">
                                    {moreFeatures.map((feature, index) => (
                                        <ListItem
                                            key={index}
                                            href={feature.href}
                                            title={feature.name}
                                            description={feature.description}>
                                            {feature.icon}
                                        </ListItem>
                                    ))}
                                </ul>
                            </div>
                            <div className="row-span-2 grid grid-rows-subgrid">
                                <div className="bg-linear-to-b inset-ring-foreground/10 inset-ring-1 relative row-span-2 grid overflow-hidden rounded-xl bg-emerald-100 from-white via-white/50 to-sky-100 p-1 transition-colors duration-200 hover:bg-emerald-50">
                                    <div className="aspect-3/2 absolute inset-0 px-6 pt-2">
                                        <div className="mask-b-from-35% before:bg-background before:ring-foreground/10 after:ring-foreground/5 after:bg-background/75 before:z-1 group relative -mx-4 h-4/5 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-t-xl before:border before:border-transparent before:ring-1 after:absolute after:inset-x-9 after:bottom-0 after:top-2 after:rounded-t-xl after:border after:border-transparent after:ring-1">
                                            <div className="bg-card ring-foreground/10 relative z-10 h-full overflow-hidden rounded-t-xl border border-transparent p-8 text-sm shadow-xl shadow-black/25 ring-1"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 self-end p-3">
                                        <NavigationMenuLink
                                            asChild
                                            className="text-foreground p-0 text-sm font-medium before:absolute before:inset-0 hover:bg-transparent focus:bg-transparent">
                                            <Link href="#">Multimodal læring</Link>
                                        </NavigationMenuLink>
                                        <p className="text-foreground/60 line-clamp-1 text-xs">Utforsk hvordan plattformen vår kombinerer tekst-, bilde- og lydprosesser i ett samlet rammeverk.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem value="solutions">
                    <NavigationMenuTrigger>Løsninger</NavigationMenuTrigger>
                    <NavigationMenuContent className="origin-top pb-1.5 pl-1 pr-4 pt-1 backdrop-blur">
                        <div className="min-w-6xl pr-18.5 grid w-full grid-cols-4 gap-1">
                            <div className="bg-card col-span-2 row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                                <span className="text-muted-foreground ml-2 text-xs">Bruksområder</span>
                                <ul className="grid grid-cols-2">
                                    {useCases.map((useCase, index) => (
                                        <ListItem
                                            key={index}
                                            href={useCase.href}
                                            title={useCase.name}
                                            description={useCase.description}>
                                            {useCase.icon}
                                        </ListItem>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-card row-span-2 grid grid-rows-subgrid gap-1 rounded-xl border p-1 pt-3">
                                <span className="text-muted-foreground ml-2 text-xs">Moduler</span>
                                <ul>
                                    {features.slice(0, features.length - 1).map((feature, index) => (
                                        <ListItem
                                            key={index}
                                            href={feature.href}
                                            title={feature.name}
                                            description={feature.description}>
                                            {feature.icon}
                                        </ListItem>
                                    ))}
                                </ul>
                            </div>
                            <div className="row-span-2 grid grid-rows-subgrid gap-1 p-1 pt-3">
                                <span className="text-muted-foreground ml-2 text-xs">Innhold</span>
                                <ul>
                                    {contentLinks.map((content, index) => (
                                        <NavigationMenuLink
                                            key={index}
                                            asChild>
                                            <Link
                                                href={content.href}
                                                className="grid grid-cols-[auto_1fr] items-center gap-2.5">
                                                {content.icon}
                                                <div className="text-foreground text-sm font-medium">{content.name}</div>
                                            </Link>
                                        </NavigationMenuLink>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem value="pricing">
                    <NavigationMenuLink
                        asChild
                        className={navigationMenuTriggerStyle()}>
                        <Link href="#">Priser</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem value="company">
                    <NavigationMenuLink
                        asChild
                        className={navigationMenuTriggerStyle()}>
                        <Link href="#">Om oss</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

function ListItem({ title, description, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string; title: string; description?: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink
                asChild
                className="rounded-lg">
                <Link
                    href={href}
                    className="grid grid-cols-[auto_1fr] gap-3.5">
                    <div className="bg-card ring-foreground/10 relative flex size-10 items-center justify-center rounded border border-transparent shadow shadow-sm ring-1">{children}</div>
                    <div className="space-y-0.5">
                        <div className="text-foreground text-sm font-medium">{title}</div>
                        <p className="text-muted-foreground line-clamp-1 text-xs">{description}</p>
                    </div>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
