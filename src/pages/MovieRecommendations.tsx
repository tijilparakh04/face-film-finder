
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Film, Info, Calendar, Clock, AlertCircle } from "lucide-react";
import { getRecommendationMessage, Movie, getPosterUrl } from "@/utils/movieData";
import MovieDetailModal from "@/components/MovieDetailModal";
import { useMovieData } from "@/hooks/useMovieData";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MovieRecommendations = () => {
  const { emotion } = useParams<{ emotion: string }>();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { isLoading: isDataLoading, isInitialized, error, getRecommendations } = useMovieData();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!emotion) return;
      
      setLoading(true);
      
      // Wait for the movie data to be initialized
      if (!isInitialized) {
        if (!isDataLoading && error) {
          toast({
            title: "Data Loading Error",
            description: "Unable to load movie data. Using fallback data.",
            variant: "destructive"
          });
        }
        // Keep showing loading state while movie data is loading
        return;
      }
      
      try {
        const movies = await getRecommendations(emotion, 8);
        setRecommendations(movies);
        
        if (movies.length === 0) {
          toast({
            title: "No Recommendations",
            description: `We couldn't find any movies matching your ${emotion} mood.`,
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error fetching movie recommendations:", error);
        toast({
          title: "Recommendation Error",
          description: "Failed to get movie recommendations.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [emotion, isInitialized, isDataLoading, error, toast, getRecommendations]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  // Get appropriate message for the emotion
  const recommendationMessage = emotion ? getRecommendationMessage(emotion) : "";

  // Function to get an emotion color
  const getEmotionColor = (emotion: string) => {
    const emotionColors: Record<string, string> = {
      happy: "bg-happy text-happy-foreground",
      sad: "bg-sad text-sad-foreground",
      angry: "bg-angry text-angry-foreground",
      disgust: "bg-disgust text-disgust-foreground",
      fear: "bg-fear text-fear-foreground",
      surprise: "bg-surprise text-surprise-foreground",
      neutral: "bg-neutral text-neutral-foreground"
    };
    
    return emotionColors[emotion?.toLowerCase()] || "bg-primary text-primary-foreground";
  };

  // Format runtime
  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };

  const showLoading = loading || (isDataLoading && !isInitialized);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Movie Recommendations</h1>
          <p className="text-muted-foreground">
            Based on your detected emotion: 
            <Badge className={`ml-2 ${getEmotionColor(emotion || "")}`}>
              {emotion}
            </Badge>
          </p>
        </div>
        <Link to="/detect">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Detection
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span>Personalized Recommendations</span>
          </CardTitle>
          <CardDescription>{recommendationMessage}</CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load movie data. Using sample data instead. Please check if the TMDB dataset file exists.
          </AlertDescription>
        </Alert>
      )}

      {showLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-muted rounded-t-lg"></div>
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Film className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Movies Found</h3>
          <p className="text-muted-foreground">
            We couldn't find any movies that match your {emotion} mood.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendations.map((movie) => (
            <Card 
              key={movie.id} 
              className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-lg cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="relative aspect-[2/3] bg-muted overflow-hidden">
                {movie.poster_path ? (
                  <img 
                    src={getPosterUrl(movie.poster_path)} 
                    alt={movie.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Film className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{movie.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {movie.year || (movie.release_date ? movie.release_date.split('-')[0] : 'Unknown')}
                  {movie.runtime && (
                    <>
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3" />
                      {formatRuntime(movie.runtime)}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                {movie.tagline && (
                  <p className="text-sm italic text-muted-foreground mb-2">"{movie.tagline}"</p>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  {movie.genres && movie.genres.slice(0, 3).map((genre) => (
                    <Badge variant="secondary" key={genre}>{genre}</Badge>
                  ))}
                  {movie.genres && movie.genres.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{movie.genres.length - 3}</Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span className="text-sm font-medium">
                    {movie.vote_average ? (movie.vote_average / 2).toFixed(1) : movie.rating} / 5
                    {movie.vote_count && <span className="text-xs text-muted-foreground ml-1">({movie.vote_count})</span>}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  <Info className="h-4 w-4" />
                  More Info
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <MovieDetailModal 
        movie={selectedMovie}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default MovieRecommendations;
