import PNDLogo from '../PNDLogo';

export default function PNDLogoExample() {
  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="text-center">
        <PNDLogo size={60} />
        <p className="mt-2 text-sm text-muted-foreground">Default (60px)</p>
      </div>
      <div className="text-center">
        <PNDLogo size={80} />
        <p className="mt-2 text-sm text-muted-foreground">Large (80px)</p>
      </div>
      <div className="text-center">
        <PNDLogo size={40} />
        <p className="mt-2 text-sm text-muted-foreground">Small (40px)</p>
      </div>
    </div>
  );
}