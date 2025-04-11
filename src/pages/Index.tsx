
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Frown, Meh, Angry, Heart, Film, Database } from "lucide-react";
import { SmilePlus } from "@/components/SmilePlus";

const Index = () => {
  return (
    <div className="flex flex-col items-center">
      <section className="py-12 text-center max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Welcome to FaceFilmFinder</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover movies that match your mood through real-time emotion detection.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/detect">
            <Button size="lg" className="gap-2">
              <SmilePlus className="h-5 w-5" />
              Start Detection
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 w-full">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-6 w-6 text-primary" />
                <span>Detect Emotion</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our app uses your webcam to analyze your facial expressions in real-time and detect your current emotional state.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-6 w-6 text-primary" />
                <span>Match Movies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Based on your dominant emotion, our algorithm finds movies from the TMDB database that complement your current mood.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <span>Enjoy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Discover personalized movie recommendations that resonate with how you're feeling right now.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 w-full bg-muted rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-4">Emotions We Detect</h2>
        <p className="text-center text-muted-foreground mb-8">Our system recognizes various emotional states to provide tailored recommendations</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 max-w-4xl mx-auto">
          <Card className="border-angry/30 bg-angry/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Angry className="h-8 w-8 text-angry mb-2" />
                <span>Angry</span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-disgust/30 bg-disgust/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Frown className="h-8 w-8 text-disgust mb-2" />
                <span>Disgust</span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-fear/30 bg-fear/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Meh className="h-8 w-8 text-fear mb-2" />
                <span>Fear</span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-happy/30 bg-happy/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Smile className="h-8 w-8 text-happy mb-2" />
                <span>Happy</span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-sad/30 bg-sad/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Frown className="h-8 w-8 text-sad mb-2" />
                <span>Sad</span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-surprise/30 bg-surprise/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Smile className="h-8 w-8 text-surprise mb-2" />
                <span>Surprise</span>
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-neutral/30 bg-neutral/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex flex-col items-center">
                <Meh className="h-8 w-8 text-neutral mb-2" />
                <span>Neutral</span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="py-6 w-full text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Database className="h-4 w-4" />
          Powered by The Movie Database (TMDB)
        </p>
      </section>
    </div>
  );
};

export default Index;
