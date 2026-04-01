'use client';

const hospitalAddress =
  process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || '123 Health Avenue, Care City, India';
const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/ronakkedia';
const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/ronak-kedia';

export default function AppFooter() {
  return (
    <footer className="border-t border-border bg-card/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>{hospitalAddress}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span>Made with ☕ by Ronak Kedia</span>
          <a href={githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            GitHub
          </a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
