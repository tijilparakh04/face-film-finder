
import { Smile, Frown, Meh, Angry } from "lucide-react";

interface EmotionVisualizerProps {
  emotions: Record<string, number>;
  dominantEmotion: string;
}

const EmotionVisualizer = ({ emotions, dominantEmotion }: EmotionVisualizerProps) => {
  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return <Smile className="h-8 w-8 text-happy" />;
      case 'sad':
        return <Frown className="h-8 w-8 text-sad" />;
      case 'angry':
        return <Angry className="h-8 w-8 text-angry" />;
      case 'disgust':
        return <Frown className="h-8 w-8 text-disgust" />;
      case 'fear':
        return <Frown className="h-8 w-8 text-fear" />;
      case 'surprise':
        return <Smile className="h-8 w-8 text-surprise" />;
      case 'neutral':
      default:
        return <Meh className="h-8 w-8 text-neutral" />;
    }
  };

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex justify-center mb-4">
        {getEmotionIcon(dominantEmotion)}
        <span className="text-xl font-bold ml-2">{dominantEmotion}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(emotions).map(([emotion, score]) => (
          <div 
            key={emotion} 
            className={`flex items-center p-2 rounded-md ${emotion === dominantEmotion ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'}`}
          >
            <div className="mr-2">{getEmotionIcon(emotion)}</div>
            <div>
              <div className="text-sm font-medium">{emotion}</div>
              <div className="text-xs text-muted-foreground">{(score * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionVisualizer;
