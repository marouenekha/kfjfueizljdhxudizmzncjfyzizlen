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
import { useTranslation } from 'react-i18next';

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

const STATUS_KEY_MAP: Record<string, string> = {
  requested: 'jobStatusRequested',
  accepted: 'jobStatusAccepted',
  in_progress: 'jobStatusInProgress',
  completed: 'jobStatusCompleted',
  cancelled: 'jobStatusCancelled',
  refused: 'jobStatusRefused',
};

export const JobManager: React.FC<JobManagerProps> = ({ otherUserId, otherUserName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showJobs, setShowJobs] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [otherRole, setOtherRole] = useState<string>('provider');

  useEffect(() => {
    if (user) fetchJobs();
    (async () => {
      const { data } = await supabase.from('profiles').select('profile_role').eq('user_id', otherUserId).maybeSingle();
      setOtherRole((data as any)?.profile_role || 'provider');
    })();
  }, [user, otherUserId]);

  const canRequestJob = otherRole === 'provider' || otherRole === 'both';

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('jobs').select('*')
        .or(`and(requester_id.eq.${user.id},provider_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},provider_id.eq.${user.id})`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobs((data || []) as Job[]);
    } catch (error: any) {
      toast({ title: t('errorFetchingJobs'), description: error.message, variant: "destructive" });
    }
  };

  const requestJob = async () => {
    if (!user || !jobTitle.trim()) return;
    try {
      const { error } = await supabase.from('jobs').insert({
        requester_id: user.id, provider_id: otherUserId,
        title: jobTitle.trim(), description: jobDescription.trim() || null, status: 'requested',
      });
      if (error) throw error;
      toast({ title: t('jobRequested'), description: t('jobRequestSent', { name: otherUserName }) });
      setJobTitle(''); setJobDescription(''); setShowRequestDialog(false); fetchJobs();
    } catch (error: any) {
      toast({ title: t('errorRequestingJob'), description: error.message, variant: "destructive" });
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: Job['status']) => {
    try {
      const { error } = await supabase.from('jobs').update({
        status: newStatus,
        ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
      }).eq('id', jobId);
      if (error) throw error;
      toast({ title: t('jobUpdated'), description: t(STATUS_KEY_MAP[newStatus] || newStatus) });
      fetchJobs();
    } catch (error: any) {
      toast({ title: t('errorUpdatingJob'), description: error.message, variant: "destructive" });
    }
  };

  const submitReview = async () => {
    if (!user || !selectedJobId || !rating) return;
    try {
      const { error } = await supabase.from('ratings').upsert({
        rater_id: user.id, rated_id: otherUserId, rating, comment: reviewComment.trim() || null,
      });
      if (error) throw error;
      toast({ title: t('reviewSubmitted'), description: t('reviewSubmittedDesc', { name: otherUserName, rating }) });
      setRating(0); setReviewComment(''); setSelectedJobId(''); setShowReviewDialog(false);
    } catch (error: any) {
      toast({ title: t('errorSubmittingReview'), description: error.message, variant: "destructive" });
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
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        {canRequestJob && (
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Briefcase className="w-4 h-4 mr-2" />
              {t('requestJob')}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('requestJobFrom', { name: otherUserName })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder={t('jobTitle')} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Textarea placeholder={t('jobDescriptionOptional')} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRequestDialog(false)} className="flex-1">{t('cancel')}</Button>
              <Button onClick={requestJob} disabled={!jobTitle.trim()} className="flex-1">{t('sendRequest')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {jobs.length > 0 && (
        <Button variant="ghost" onClick={() => setShowJobs(!showJobs)} className="w-full justify-center">
          {showJobs ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showJobs ? t('hideJobs') : t('showJobs')} ({jobs.length})
        </Button>
      )}

      {showJobs && jobs.length > 0 && (
        <div className="space-y-2">
          <Separator />
          {jobs.map((job) => (
            <div key={job.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{job.title}</h4>
                  {job.description && <p className="text-xs text-muted-foreground mt-1">{job.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {user?.id === job.requester_id ? t('requestedByYou') : t('requestedBy', { name: otherUserName })}
                  </p>
                </div>
                <Badge variant={getStatusColor(job.status)} className="ml-2">
                  {getStatusIcon(job.status)}
                  <span className="ml-1 capitalize">{t(STATUS_KEY_MAP[job.status] || job.status)}</span>
                </Badge>
              </div>

              <div className="flex gap-2">
                {canAcceptRefuse(job) && (
                  <>
                    <Button size="sm" onClick={() => updateJobStatus(job.id, 'in_progress')}>{t('accept')}</Button>
                    <Button size="sm" variant="outline" onClick={() => updateJobStatus(job.id, 'refused')}>{t('refuse')}</Button>
                  </>
                )}
                {canEndJob(job) && (
                  <Button size="sm" onClick={() => { updateJobStatus(job.id, 'completed'); setSelectedJobId(job.id); setTimeout(() => setShowReviewDialog(true), 1000); }}>
                    {t('endJob')}
                  </Button>
                )}
                {canCancelJob(job) && (
                  <Button size="sm" variant="outline" onClick={() => updateJobStatus(job.id, 'cancelled')}>{t('cancelJob')}</Button>
                )}
                {canReview(job) && (
                  <Button size="sm" variant="outline" onClick={() => { setSelectedJobId(job.id); setShowReviewDialog(true); }}>
                    <Star className="w-3 h-3 mr-1" />{t('review')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('reviewUser', { name: otherUserName })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder={t('shareExperience')} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} maxLength={300} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="flex-1">{t('skip')}</Button>
              <Button onClick={submitReview} disabled={!rating} className="flex-1">{t('submitReview')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
