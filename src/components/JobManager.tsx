import { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, Clock, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface JobManagerProps {
  otherUserId: string;
  otherUserName: string;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'refused';
  requester_id: string;
  provider_id: string;
  created_at: string;
}

export const JobManager: React.FC<JobManagerProps> = ({ otherUserId, otherUserName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showJobs, setShowJobs] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, otherUserId]);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .or(`and(requester_id.eq.${user.id},provider_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},provider_id.eq.${user.id})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []) as Job[]);
    } catch (error: any) {
      toast({
        title: "Error fetching jobs",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const requestJob = async () => {
    if (!user || !jobTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          requester_id: user.id,
          provider_id: otherUserId,
          title: jobTitle.trim(),
          description: jobDescription.trim() || null,
          status: 'requested',
        });

      if (error) throw error;

      toast({
        title: "Job requested",
        description: `Job request sent to ${otherUserName}`,
      });

      setJobTitle('');
      setJobDescription('');
      setShowRequestDialog(false);
      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error requesting job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: Job['status']) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: newStatus,
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job updated",
        description: `Job ${newStatus.replace('_', ' ')}`,
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const submitReview = async () => {
    if (!user || !selectedJobId || !rating) return;

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          rater_id: user.id,
          rated_id: otherUserId,
          rating,
          comment: reviewComment.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: `You rated ${otherUserName} ${rating} star${rating !== 1 ? 's' : ''}`,
      });

      setRating(0);
      setReviewComment('');
      setSelectedJobId('');
      setShowReviewDialog(false);
    } catch (error: any) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'requested': return <Clock className="w-4 h-4" />;
      case 'accepted': case 'in_progress': return <Briefcase className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': case 'refused': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'requested': return 'secondary';
      case 'accepted': case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': case 'refused': return 'destructive';
      default: return 'secondary';
    }
  };

  const canAcceptRefuse = (job: Job) => user?.id === job.provider_id && job.status === 'requested';
  const canEndJob = (job: Job) => user?.id === job.requester_id && job.status === 'in_progress';
  const canCancelJob = (job: Job) => user?.id === job.provider_id && job.status === 'in_progress';
  const canReview = (job: Job) => user?.id === job.requester_id && job.status === 'completed';

  return (
    <div className="space-y-3">
      {/* Job Request Button */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Briefcase className="w-4 h-4 mr-2" />
            Request Job
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Job from {otherUserName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <Textarea
              placeholder="Job Description (optional)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={requestJob}
                disabled={!jobTitle.trim()}
                className="flex-1"
              >
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show/Hide Jobs Toggle */}
      {jobs.length > 0 && (
        <Button
          variant="ghost"
          onClick={() => setShowJobs(!showJobs)}
          className="w-full justify-center"
        >
          {showJobs ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showJobs ? 'Hide Jobs' : 'Show Jobs'} ({jobs.length})
        </Button>
      )}

      {/* Jobs List */}
      {showJobs && jobs.length > 0 && (
        <div className="space-y-2">
          <Separator />
          {jobs.map((job) => (
            <div key={job.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{job.title}</h4>
                  {job.description && (
                    <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {user?.id === job.requester_id ? 'Requested by you' : `Requested by ${otherUserName}`}
                  </p>
                </div>
                <Badge variant={getStatusColor(job.status)} className="ml-2">
                  {getStatusIcon(job.status)}
                  <span className="ml-1 capitalize">{job.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              {/* Job Actions */}
              <div className="flex gap-2">
                {canAcceptRefuse(job) && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateJobStatus(job.id, 'in_progress')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateJobStatus(job.id, 'refused')}
                    >
                      Refuse
                    </Button>
                  </>
                )}

                {canEndJob(job) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateJobStatus(job.id, 'completed');
                      setSelectedJobId(job.id);
                      setTimeout(() => setShowReviewDialog(true), 1000);
                    }}
                  >
                    End Job
                  </Button>
                )}

                {canCancelJob(job) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateJobStatus(job.id, 'cancelled')}
                  >
                    Cancel Job
                  </Button>
                )}

                {canReview(job) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setShowReviewDialog(true);
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {otherUserName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Star Rating */}
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              placeholder="Share your experience (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              maxLength={300}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={submitReview}
                disabled={!rating}
                className="flex-1"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};