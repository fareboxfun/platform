import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] font-sans">
      <div className="bg-white border-2 border-black p-10 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
          404 Not Found
        </h1>
        <p className="text-lg text-muted-foreground font-medium mb-8">
          The route you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-block w-full py-4 bg-black text-white font-black tracking-widest uppercase border border-black shadow-[4px_4px_0px_0px_rgba(124,58,237,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(124,58,237,1)] transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
