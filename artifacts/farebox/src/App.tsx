import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PrivyProvider } from '@privy-io/react-auth';
import { PrivyAuthProvider } from './lib/privy';
import { useEffect } from 'react';

import Landing from './pages/landing';
import ModelsPage from './pages/models-page';
import Docs from './pages/docs';
import Architecture from './pages/architecture';
import About from './pages/about';
import DashboardLayout from './components/dashboard-layout';
import Dashboard from './pages/dashboard';
import Keys from './pages/keys';
import Balance from './pages/balance';
import Usage from './pages/usage';
import Models from './pages/models';
import Playground from './pages/playground';
import StatusPage from './pages/status';
import SkillPage from './pages/skill';
import ComputePage from './pages/compute';
import McpPage from './pages/mcp';
import X402Page from './pages/x402';
import RoadmapPage from './pages/roadmap';
import SecurityPage from './pages/security';
import PrivacyPage from './pages/privacy';
import TermsPage from './pages/terms';
import NotFound from './pages/not-found';

const queryClient = new QueryClient();

/** Redirect stats.farebox.fun → /status automatically */
function SubdomainGate() {
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'stats.farebox.fun' &&
      location !== '/status'
    ) {
      navigate('/status', { replace: true });
    }
  }, [location]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <SubdomainGate />
      <Switch>
        <Route path="/" component={Landing} />

        {/* Public pages */}
        <Route path="/models"       component={ModelsPage}   />
        <Route path="/docs"         component={Docs}         />
        <Route path="/architecture" component={Architecture} />
        <Route path="/about"        component={About}        />
        <Route path="/status"       component={StatusPage}   />
        <Route path="/skill"        component={SkillPage}    />
        <Route path="/compute"      component={ComputePage}  />
        <Route path="/mcp"          component={McpPage}      />
        <Route path="/x402"         component={X402Page}     />
        <Route path="/roadmap"      component={RoadmapPage}  />
        <Route path="/security"     component={SecurityPage} />
        <Route path="/privacy"      component={PrivacyPage}  />
        <Route path="/terms"        component={TermsPage}    />

        {/* Playground is full screen, outside dashboard layout */}
        <Route path="/playground" component={Playground} />

        {/* Dashboard pages wrap in layout */}
        <Route path="/dashboard">
          <DashboardLayout><Dashboard /></DashboardLayout>
        </Route>
        <Route path="/dashboard/keys">
          <DashboardLayout><Keys /></DashboardLayout>
        </Route>
        <Route path="/dashboard/balance">
          <DashboardLayout><Balance /></DashboardLayout>
        </Route>
        <Route path="/dashboard/usage">
          <DashboardLayout><Usage /></DashboardLayout>
        </Route>
        <Route path="/dashboard/models">
          <DashboardLayout><Models /></DashboardLayout>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <PrivyProvider
      appId="cmrrszjm4002d0cl2lgerfdms"
      config={{
        loginMethods: ['wallet'],
        appearance: {
          accentColor: '#7C3AED',
          theme: 'light',
          logo: '/logo.png',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: 'off',
        },
      }}
    >
      <PrivyAuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </PrivyAuthProvider>
    </PrivyProvider>
  );
}

export default App;
