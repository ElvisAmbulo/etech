interface Props {
  badge?: string;
  title: string;
  description?: string;
  center?: boolean;
}

const SectionHeading = ({ badge, title, description, center = true }: Props) => (
  <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""} mb-12`}>
    {badge && (
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary">
        {badge}
      </span>
    )}
    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
    {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
  </div>
);

export default SectionHeading;
