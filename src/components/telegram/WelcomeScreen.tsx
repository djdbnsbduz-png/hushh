import hushImage from '@/assets/hush.png';

export const WelcomeScreen = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-bg">
      <div className="text-center max-w-md px-8">
        <div className="mb-8 space-y-6">
          <h1 className="text-6xl font-bold text-black animate-fade-in" style={{ animationDelay: '0ms' }}>
            隱私
          </h1>
          
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <img 
              src={hushImage} 
              alt="Hush" 
              className="w-48 h-48 mx-auto object-contain invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
};