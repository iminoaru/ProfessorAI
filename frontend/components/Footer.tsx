import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageSquare, Linkedin, Twitter, Mail } from 'lucide-react'


export default function Footer() {
  return (
    <footer className="container relative mt-8 sm:mt-12 md:mt-16">
      {/* Subtle gradient border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 py-6 sm:py-10 md:py-12">
        {/* Copyright and Legal Links */}
        <div className="text-center sm:text-left flex flex-col sm:flex-col items-center sm:items-start gap-1">
          <p className="text-sm text-muted-foreground/80 hover:text-muted-foreground/100 transition-colors">
            © 2024 ProessorAI, Inc. All rights reserved.
          </p>
          
        </div>

        {/* Social icons and feedback button */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
          

          <SocialLink
            href="https://www.linkedin.com/company/ProessorAI/"
            icon={<Linkedin className="h-5 w-5" />}
            label="LinkedIn"
          />
          <SocialLink
            href="https://x.com/ProessorAI"
            icon={<Twitter className="h-5 w-5" />}
            label="Twitter"
          />
          <SocialLink
            href="mailto:info@ProessorAI.ai"
            icon={<Mail className="h-5 w-5" />}
            label="Email"
          />
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            asChild
          >
            <a
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {icon}
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}