import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

type FooterProps = React.ComponentProps<'footer'> & {
	children: React.ReactNode;
};

export function Footer({ className, ...props }: Omit<FooterProps, 'children'>) {
	return (
		<footer
			className={cn(
				'border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]',
				className,
			)}
			{...props}
		>
			<div className="relative mx-auto max-w-5xl px-4">
				<div className="relative grid grid-cols-1 border-x md:grid-cols-2 md:divide-x">
					{/* X (Twitter) Section */}
					<div>
						<SocialCard title="X" href="https://x.com/arafeymasood" />
						<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x">
							<LinksGroup
								title="About Us"
								links={[
									{ title: 'Pricing', href: '#' },
									{ title: 'Testimonials', href: '#' },
									{ title: 'FAQs', href: '#' },
									{ title: 'Contact Us', href: '#' },
									{ title: 'Blog', href: '#' },
								]}
							/>
							<LinksGroup
								title="Support"
								links={[
									{ title: 'Help Center', href: '#' },
									{ title: 'Terms', href: '#' },
									{ title: 'Privacy', href: '#' },
									{ title: 'Security', href: '#' },
									{ title: 'Cookie Policy', href: '#' },
								]}
							/>
						</div>
					</div>

					{/* Instagram Section */}
					<div>
						<SocialCard title="Instagram" href="#" />
						<div className="grid grid-cols-1 md:grid-cols-2 md:divide-x">
							<LinksGroup
								title="Community"
								links={[
									{ title: 'Forum', href: '#' },
									{ title: 'Events', href: '#' },
									{ title: 'Partners', href: '#' },
									{ title: 'Affiliates', href: '#' },
									{ title: 'Career', href: '#' },
								]}
							/>
							<LinksGroup
								title="Press"
								links={[
									{ title: 'Investors', href: '#' },
									{ title: 'Terms of Use', href: '#' },
									{ title: 'Privacy Policy', href: '#' },
									{ title: 'Cookie Policy', href: '#' },
									{ title: 'Legal', href: '#' },
								]}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-center border-t p-3">
				<p className="text-muted-foreground text-xs">
					© {new Date().getFullYear()} Momentum. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

interface LinksGroupProps {
	title: string;
	links: { title: string; href: string }[];
}
function LinksGroup({ title, links }: LinksGroupProps) {
	return (
		<div className="p-2">
			<h3 className="text-foreground/75 mt-2 mb-4 text-xs font-medium tracking-wider uppercase">
				{title}
			</h3>
			<ul>
				{links.map((link) => (
					<li key={link.title}>
						<a
							href={link.href}
							className="text-muted-foreground hover:text-foreground text-xs"
						>
							{link.title}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

function SocialCard({ title, href }: { title: string; href: string }) {
	return (
		<a
			href={href}
			className="hover:bg-accent hover:text-accent-foreground flex items-center justify-center border-t border-b p-2 text-sm md:border-t-0 relative group"
		>
			<span className="font-medium">{title}</span>
			<ArrowRight className="h-4 w-4 transition-colors absolute right-2 opacity-0 group-hover:opacity-100" />
		</a>
	);
}
