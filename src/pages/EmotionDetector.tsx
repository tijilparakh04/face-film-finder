
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronRight, Film, RefreshCw, Smile, Frown, Meh } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Slider } from "@/components/ui/slider";
import EmotionVisualizer from "@/components/EmotionVisualizer";
import axios from "axios";

// API endpoint
const API_BASE_URL = 'http://localhost:5000/api';
const EMOTION_DETECTION_ENDPOINT = `${API_BASE_URL}/detect-emotion`;

const EmotionDetector = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [emotions, setEmotions] = useState<Record<string, number>>({});
  const [dominantEmotion, setDominantEmotion] = useState<string>("");
  const [detectionInterval, setDetectionInterval] = useState<number>(1000); // 1 second default
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const intervalRef = useRef<number | undefined>();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if backend is available
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/health`);
        setBackendAvailable(response.data.status === 'healthy');
        
        if (response.data.status !== 'healthy') {
          toast({
            title: "Backend connection issue",
            description: "The emotion detection service is not available.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          toast({
            title: "Backend connected",
            description: "Successfully connected to emotion detection service.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
        setBackendAvailable(false);
        toast({
          title: "Backend not available",
          description: "Unable to connect to the emotion detection service.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkBackendStatus();
  }, [toast]);

  const startCamera = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        toast({
          title: "Camera started",
          description: "Your webcam is now active for emotion detection.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use emotion detection.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
    stopDetection();
  };

  const captureFrame = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error("Video or canvas reference not available"));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 image
      const base64Image = canvas.toDataURL('image/jpeg');
      resolve(base64Image);
    });
  };

  const startDetection = () => {
    if (!isStreaming) {
      toast({
        title: "Camera not started",
        description: "Please start the camera first.",
        variant: "destructive",
      });
      return;
    }

    if (!backendAvailable) {
      toast({
        title: "Backend not available",
        description: "The emotion detection service is not available.",
        variant: "destructive",
      });
      return;
    }

    setDetecting(true);
    toast({
      title: "Emotion detection started",
      description: `Analyzing your emotions every ${detectionInterval / 1000} seconds.`,
    });

    // Clear any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    // Set up a new interval for emotion detection
    intervalRef.current = window.setInterval(async () => {
      try {
        // Capture current video frame as base64 image
        const base64Image = await captureFrame();
        
        // Send the image to the backend for emotion detection
        const response = await axios.post(EMOTION_DETECTION_ENDPOINT, {
          image: base64Image
        });
        
        // Update emotion state with response
        setDominantEmotion(response.data.dominantEmotion);
        setEmotions(response.data.emotions);
      } catch (error) {
        console.error("Error detecting emotion:", error);
      }
    }, detectionInterval);
  };

  const stopDetection = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setDetecting(false);
  };

  const goToRecommendations = () => {
    if (dominantEmotion) {
      navigate(`/recommendations/${dominantEmotion.toLowerCase()}`);
    } else {
      toast({
        title: "No emotion detected",
        description: "Please run the emotion detection first.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Prepare data for chart
  const chartData = Object.entries(emotions).map(([name, value]) => ({
    name,
    value: parseFloat((value * 100).toFixed(1)),
    fill: name === dominantEmotion ? `var(--${name.toLowerCase()})` : "#CBD5E0",
  }));

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Emotion Detection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <span>Webcam Feed</span>
            </CardTitle>
            <CardDescription>
              Position your face clearly in the camera view
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="webcam-container bg-black/5 rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                className="w-full h-auto"
                muted 
                playsInline
              />
              <canvas 
                ref={canvasRef} 
                className="hidden" // Hidden as it's just for processing
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant={isStreaming ? "destructive" : "default"} 
              onClick={isStreaming ? stopCamera : startCamera}
              disabled={loading}
            >
              {loading ? "Starting..." : (isStreaming ? "Stop Camera" : "Start Camera")}
            </Button>
            
            <Button 
              variant={detecting ? "destructive" : "default"}
              onClick={detecting ? stopDetection : startDetection}
              disabled={!isStreaming || loading}
            >
              {detecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Stop Detection
                </>
              ) : "Start Detection"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5" />
              <span>Emotion Analysis</span>
            </CardTitle>
            <CardDescription>
              Real-time emotion detection results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(emotions).length > 0 ? (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Dominant Emotion:</h3>
                  <div className={`text-2xl font-bold text-${dominantEmotion?.toLowerCase()}`}>
                    {dominantEmotion}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(emotions).map(([emotion, score]) => (
                    <div key={emotion}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{emotion}</span>
                        <span className="text-sm font-medium">{(score * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={score * 100} 
                        className={`h-2 bg-muted ${emotion === dominantEmotion ? `bg-${emotion.toLowerCase()}/20` : ""}`}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Meh className="h-12 w-12 mx-auto mb-2" />
                <p>No emotion data available yet</p>
                <p className="text-sm">Start detection to see results</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={goToRecommendations} 
              disabled={!dominantEmotion}
              className="w-full"
            >
              <Film className="mr-2 h-4 w-4" />
              Get Movie Recommendations
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {Object.keys(emotions).length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Emotion Visualization</CardTitle>
            <CardDescription>
              Graphical representation of detected emotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Confidence']} />
                <Bar dataKey="value" name="Confidence" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Detection Settings</CardTitle>
          <CardDescription>
            Adjust parameters for emotion detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Detection Interval</label>
                <span className="text-sm">{detectionInterval / 1000} seconds</span>
              </div>
              <Slider 
                value={[detectionInterval]} 
                min={500} 
                max={5000} 
                step={500}
                onValueChange={(value) => setDetectionInterval(value[0])}
                disabled={detecting}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adjust how frequently emotion detection is performed (faster intervals may affect performance)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionDetector;
