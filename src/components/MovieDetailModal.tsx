
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Movie, getPosterUrl } from "@/utils/movieData";
import { Star, Calendar, Clock, DollarSign, Film, Globe, Clapperboard } from "lucide-react";

interface MovieDetailModalProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MovieDetailModal = ({ movie, open, onOpenChange }: MovieDetailModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange(newOpen);
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format runtime
  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{movie.title}</DialogTitle>
          <DialogDescription>
            {movie.tagline}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
            {movie.poster_path ? (
              <img 
                src={getPosterUrl(movie.poster_path)} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Film className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p>{movie.overview}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Release Date</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Runtime</div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatRuntime(movie.runtime)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Rating</div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                  {movie.vote_average ? (movie.vote_average / 2).toFixed(1) : 'N/A'} / 5
                  {movie.vote_count && <span className="text-xs ml-1">({movie.vote_count})</span>}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Budget</div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(movie.budget)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatCurrency(movie.revenue)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Original Language</div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {movie.original_language?.toUpperCase() || 'Unknown'}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm text-muted-foreground mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>
            </div>
            
            {movie.keywords && movie.keywords.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm text-muted-foreground mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-1">
                  {movie.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              {movie.homepage && (
                <Button variant="outline" size="sm" asChild>
                  <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
                    Visit Homepage
                  </a>
                </Button>
              )}
              
              {movie.imdb_id && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer">
                    View on IMDb
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailModal;
