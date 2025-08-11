import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { t } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.profile?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNameUpdate = async () => {
    try {
      await updateProfile({ name });
      toast({ title: t('nameUpdatedSuccessfully', 'Name updated successfully') });
    } catch (error: any) {
      toast({ 
        title: t('failedToUpdateName', 'Failed to update name'), 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleEmailUpdate = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast({ 
        title: t('emailUpdateSent', 'Email update sent'), 
        description: t('checkEmailConfirm', 'Check your email to confirm the change') 
      });
    } catch (error: any) {
      toast({ 
        title: t('failedToUpdateEmail', 'Failed to update email'), 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: t('passwordsDontMatch', "Passwords don't match"), variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: t('passwordChangedSuccessfully', 'Password changed successfully') });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ 
        title: t('failedToChangePassword', 'Failed to change password'), 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user!.id);
      if (error) throw error;
      logout();
      toast({ title: t('accountDeletedSuccessfully', 'Account deleted successfully') });
    } catch (error: any) {
      toast({ 
        title: t('failedToDeleteAccount', 'Failed to delete account'), 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <Layout title={t('settings')}>
      <div className="container-mobile space-y-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌐 {t('language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('selectLanguage')}</p>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Change Name */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👤 {t('changeName', 'Change Name')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name', 'Name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterYourName', 'Enter your name')}
                />
              </div>
              <Button onClick={handleNameUpdate} disabled={!name.trim() || name === user?.profile?.name}>
                {t('updateName', 'Update Name')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📧 {t('changeEmail', 'Change Email Address')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddress', 'Email Address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterYourEmail', 'Enter your email')}
                />
              </div>
              <Button onClick={handleEmailUpdate} disabled={!email.trim() || email === user?.email}>
                {t('updateEmail', 'Update Email')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔒 {t('changePassword', 'Change Password')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('currentPassword', 'Current Password')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('enterCurrentPassword', 'Enter current password')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('newPassword', 'New Password')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('enterNewPassword', 'Enter new password')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmNewPassword', 'Confirm New Password')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmNewPassword', 'Confirm new password')}
                />
              </div>
              <Button 
                onClick={handlePasswordChange} 
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                {t('changePassword', 'Change Password')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              🗑️ {t('deleteAccount', 'Delete Account')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('deleteAccountWarning', 'This action cannot be undone. This will permanently delete your account and all associated data.')}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">{t('deleteAccount', 'Delete Account')}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('areYouSure', 'Are you absolutely sure?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('deleteAccountConfirm', 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers.')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel', 'Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('deleteAccount', 'Delete Account')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}