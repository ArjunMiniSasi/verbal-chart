import { Header } from "@/components/Header";
import { AudioUpload } from "@/components/AudioUpload";
import { Transcript } from "@/components/Transcript";
import { SOAPEditor } from "@/components/SOAPEditor";
import { CaseSummary } from "@/components/CaseSummary";
import { PreviewModal } from "@/components/PreviewModal";
import { useMedoraStore } from "@/stores/medoraStore";

const Index = () => {
  const { currentPatient, transcript, soapNote } = useMedoraStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        {!currentPatient ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Medical Scribe
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Upload audio files to generate transcripts and SOAP notes using AI
            </p>
            <AudioUpload />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <AudioUpload />
                <Transcript />
              </div>
              <div className="space-y-6">
                <SOAPEditor />
                {transcript.length > 0 && <CaseSummary />}
              </div>
            </div>
          </div>
        )}
      </div>
      <PreviewModal />
    </div>
  );
};

export default Index;
