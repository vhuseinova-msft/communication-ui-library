import React, { useEffect, useState } from 'react';
import { CallAdapter, CallComposite, createAzureCommunicationCallAdapter } from '@azure/communication-react';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

console.log(CallComposite);

const userId = '8:acs:dd9753c0-6e62-4f74-ab0f-c94f9723b4eb_0000000f-fcc6-ade4-290c-113a0d00e431';
const displayName = 'James';
const callId = 'a28a0b49-6b1a-4b22-b336-1e1d933d24cc';
const token =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNCIsIng1dCI6IlJDM0NPdTV6UENIWlVKaVBlclM0SUl4Szh3ZyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOmRkOTc1M2MwLTZlNjItNGY3NC1hYjBmLWM5NGY5NzIzYjRlYl8wMDAwMDAwZi1mY2M2LWFkZTQtMjkwYy0xMTNhMGQwMGU0MzEiLCJzY3AiOjE3OTIsImNzaSI6IjE2NDY1MzA5ODgiLCJleHAiOjE2NDY2MTczODgsImFjc1Njb3BlIjoiY2hhdCx2b2lwIiwicmVzb3VyY2VJZCI6ImRkOTc1M2MwLTZlNjItNGY3NC1hYjBmLWM5NGY5NzIzYjRlYiIsImlhdCI6MTY0NjUzMDk4OH0.ezvFQUto0ENQTozrhaqQvU_3MXQWjlW5Fd71rjFrA18YIb2sd2EoaqLw6KbQTNDB3N5g3TVt9J4gCNaX8ho7fyGDMz5sGDLEgjzvWkx8qw_S-ypUC2IZvi3zWx9n-2s6D3gauIvifP6PZ7A8IRBzuaAHEDI8jDi-lJy8cq_2i3QQ8kd38kBPv7nZxkkQs3h3sDVam_shjuGFLfoRXCcUr3mc9Ur9e9mgrPsaML7NQwahNcVuT411ltXPBTmuG1kv9F2Y3UPP7pMxQGP_odmCKueSW0NSr-_OJzaoJB6frEbzIdXySA18_xsPRE532_GdY-_rgBEoS_87zwUuKP6YUw';

function App() {
  const [callAdapter, setCallAdapter] = useState<CallAdapter>();
  useEffect(() => {
    const createAdapter = async (): Promise<void> => {
      setCallAdapter(
        await createAzureCommunicationCallAdapter({
          userId: { communicationUserId: userId },
          displayName,
          credential: new AzureCommunicationTokenCredential(token),
          locator: { groupId: callId }
        })
      );
    };
    createAdapter();
    return () => {
      if (callAdapter) {
        callAdapter.dispose();
      }
    };
  }, [callAdapter]);

  if (!callAdapter) return <>Initializing...</>;

  return (
    <div style={{ height: '100vh', width: '100vw' }}>{callAdapter && <CallComposite adapter={callAdapter} />}</div>
  );
}

export default App;
