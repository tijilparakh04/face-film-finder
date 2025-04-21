import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Film, Info, Calendar, Clock, AlertCircle } from "lucide-react";
import { getRecommendationMessage, Movie, getPosterUrl, getMovieRecommendationsByEmotion } from "@/utils/movieData";
import MovieDetailModal from "@/components/MovieDetailModal";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MovieRecommendations = () => {
  const { emotion = 'neutral' } = useParams<{ emotion?: string }>();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { movies, error } = await getMovieRecommendationsByEmotion(emotion, 8);
        
        if (error) {
          toast({
            title: "Using Fallback Data",
            description: "Couldn't load full dataset, using sample movies",
            variant: "destructive"
          });
        }
        
        setRecommendations(movies);
        
        if (movies.length === 0) {
          toast({
            title: "No Recommendations",
            description: `We couldn't find any movies matching your ${emotion} mood.`,
            variant: "default"
          });
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
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
  }, [emotion, toast]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const getEmotionColor = (emotion: string) => {
    const emotionColors: Record<string, string> = {
      happy: "bg-green-100 text-green-800",
      sad: "bg-blue-100 text-blue-800",
      angry: "bg-red-100 text-red-800",
      disgust: "bg-yellow-100 text-yellow-800",
      fear: "bg-purple-100 text-purple-800",
      surprise: "bg-pink-100 text-pink-800",
      neutral: "bg-gray-100 text-gray-800"
    };
    
    return emotionColors[emotion.toLowerCase()] || "bg-primary text-primary-foreground";
  };

  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Movie Recommendations</h1>
          <div className="flex items-center">
            <p className="text-muted-foreground">
              Based on your detected emotion:
            </p>
            <Badge className={`ml-2 ${getEmotionColor(emotion)}`}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </Badge>
          </div>
        </div>
        <Link to="/detect" className="w-full sm:w-auto">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            Back to Detection
          </Button>
        </Link>
      </div>

      {/* Recommendation message */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span>Personalized Recommendations</span>
          </CardTitle>
          <CardDescription>{getRecommendationMessage(emotion)}</CardDescription>
        </CardHeader>
      </Card>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load movie data. Using sample movies instead.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
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
              className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-lg cursor-pointer hover:scale-[1.02]"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="relative aspect-[2/3] bg-muted overflow-hidden">
                {movie.poster_path ? (
                  <img 
                    src={getPosterUrl(movie.poster_path)} 
                    alt={movie.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-movie.png';
                      e.currentTarget.className = 'w-full h-full object-contain p-4 bg-muted';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Film className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{movie.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
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
                  <p className="text-sm italic text-muted-foreground mb-2 line-clamp-2">"{movie.tagline}"</p>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  {movie.genres?.slice(0, 3).map((genre) => (
                    <Badge variant="secondary" key={genre} className="text-xs">{genre}</Badge>
                  ))}
                  {movie.genres && movie.genres.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{movie.genres.length - 3}</Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span className="text-sm font-medium">
                    {movie.rating?.toFixed(1) || (movie.vote_average ? (movie.vote_average / 2).toFixed(1) : 'N/A')} / 5
                    {movie.vote_count && <span className="text-xs text-muted-foreground ml-1">({movie.vote_count.toLocaleString()})</span>}
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