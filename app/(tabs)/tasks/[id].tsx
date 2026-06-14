import {
 ActivityIndicator,
 Alert,
 Image,
 ScrollView,
 StyleSheet,
 Text,
 TouchableOpacity,
 View,
} from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, ChevronLeft, Circle, Paperclip } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { useTasksStore } from '../../../store';
import ScreenWrapper from '../../../components/screen-wrapper';
import ImagePreviewModal from '../../../components/ui/modals/image-preview-modal';
import { BorderRadius, Colors, FontSize, Spacing } from '../../../constants/theme';
import { formatDueDate } from '../../../utils';

function normalizeParam(value: string | string[] | undefined): string {
 return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function getFileName(fileUrl: string): string {
 const cleanUrl = fileUrl.split('?')[0] ?? fileUrl;
 return decodeURIComponent(cleanUrl.split('/').pop() || 'Attachment');
}

function isImageFile(fileUrl: string): boolean {
 const cleanUrl = fileUrl.split('?')[0] ?? fileUrl;
 return /\.(jpg|jpeg|png|webp|heic|gif)$/i.test(cleanUrl);
}

export default function TaskDetailsScreen() {
 const { id } = useLocalSearchParams<{ id?: string | string[] }>();
 const taskId = normalizeParam(id);
 const { tasks, updateTask, isLoading, hasHydrated } = useTasksStore();
 const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

 const storeTask = tasks.find((task) => task.id === taskId) ?? null;
 const task = storeTask;

 const toggleCompleted = async () => {
  if (!task) return;

  const nextCompleted = !task.isCompleted;
  updateTask(task.id, { isCompleted: nextCompleted });

  const { error } = await supabase
   .from('tasks')
   .update({ is_completed: nextCompleted })
   .eq('id', task.id);

  if (error) {
   updateTask(task.id, { isCompleted: task.isCompleted });
   Alert.alert('Unable to update task', 'Please try again.');
  }
 };

 if (isLoading || !hasHydrated) {
  return (
   <ScreenWrapper>
    <View style={styles.centerContent}>
     <ActivityIndicator size="large" color={Colors.primary} />
    </View>
   </ScreenWrapper>
  );
 }

 if (!task) {
  return (
   <ScreenWrapper>
    <View style={styles.header}>
     <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
      <ChevronLeft size={24} color={Colors.text} />
     </TouchableOpacity>
    </View>
    <View style={styles.centerContent}>
     <Text style={styles.emptyTitle}>Task not found</Text>
     <Text style={styles.emptyText}>It may have been deleted or moved.</Text>
    </View>
   </ScreenWrapper>
  );
 }

 const fileUrls = task.fileUrls ?? [];
 const imageUrls = fileUrls.filter(isImageFile);
 const otherFileUrls = fileUrls.filter((fileUrl) => !isImageFile(fileUrl));

 return (
  <ScreenWrapper>
   <View style={styles.header}>
    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
     <ChevronLeft size={24} color={Colors.text} />
    </TouchableOpacity>
    <TouchableOpacity
     style={[styles.statusButton, task.isCompleted && styles.statusButtonCompleted]}
     onPress={toggleCompleted}
     activeOpacity={0.85}
    >
     {task.isCompleted ? (
      <CheckCircle2 size={20} color={Colors.background} />
     ) : (
      <Circle size={20} color={Colors.text} />
     )}
     <Text style={[styles.statusText, task.isCompleted && styles.statusTextCompleted]}>
      {task.isCompleted ? 'Completed' : 'Mark done'}
     </Text>
    </TouchableOpacity>
   </View>

   <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Text style={styles.title}>{task.title}</Text>

    <View style={styles.taskContent}>
     <View style={styles.detailsCont}>
      <Text style={styles.detailLabel}>
       Due: {formatDueDate(task.dueDate)} {task.dueTime ? task.dueTime.slice(0, 5) : 'No time'}
      </Text>
      <Text style={styles.detailLabel}>
       Reminder: {typeof task.alertMinutes === 'number' ? `${task.alertMinutes}m before` : 'None'}
      </Text>
     </View>

     <View style={{ paddingRight: 36 }}>
      <Text style={styles.sectionTitle}>Notes</Text>
      <Text style={{ fontSize: FontSize.md, color: Colors.text }}>
       {task.notes?.trim() || 'No notes added.'}
      </Text>
     </View>

     <View>
      <Text style={styles.sectionTitle}>Files</Text>
      {fileUrls.length ? (
       <View style={styles.filesContent}>
        {imageUrls.length ? (
         <View style={styles.imageGrid}>
          {imageUrls.map((fileUrl) => (
           <TouchableOpacity
            key={fileUrl}
            style={styles.imageThumbButton}
            activeOpacity={0.85}
            onPress={() => setPreviewImageUri(fileUrl)}
           >
            <Image source={{ uri: fileUrl }} style={styles.imageThumb} />
           </TouchableOpacity>
          ))}
         </View>
        ) : null}

        {otherFileUrls.length ? (
         <View style={styles.filesList}>
          {otherFileUrls.map((fileUrl) => (
           <View key={fileUrl} style={styles.fileRow}>
            <Paperclip size={18} color={Colors.textSecondary} />
            <Text style={styles.fileText} numberOfLines={1}>
             {getFileName(fileUrl)}
            </Text>
           </View>
          ))}
         </View>
        ) : null}
       </View>
      ) : (
       <Text style={styles.bodyText}>No files attached.</Text>
      )}
     </View>
    </View>
   </ScrollView>

   <ImagePreviewModal
    visible={!!previewImageUri}
    imageUri={previewImageUri}
    onClose={() => setPreviewImageUri(null)}
   />
  </ScreenWrapper>
 );
}

const styles = StyleSheet.create({
 header: {
  paddingTop: Spacing.md,
  marginBottom: Spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
 },
 iconButton: {
  width: 40,
  height: 40,
  justifyContent: 'center',
 },
 statusButton: {
  minHeight: 40,
  borderRadius: BorderRadius.xl,
  paddingHorizontal: Spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.xs,
  backgroundColor: '#F2F2F2',
 },
 statusButtonCompleted: {
  backgroundColor: Colors.primary,
 },
 statusText: {
  fontSize: FontSize.sm,
  color: Colors.text,
  fontWeight: '600',
 },
 statusTextCompleted: {
  color: Colors.background,
 },
 content: {
  paddingBottom: Spacing.xl,
 },
 taskContent: {
  gap: Spacing.md,
 },
 title: {
  fontSize: FontSize.xxl,
  fontWeight: '700',
  color: Colors.text,
  marginBottom: Spacing.xs,
 },
 detailsCont: {
  gap: Spacing.sm,
 },
 detailLabel: {
  fontSize: FontSize.md,
  color: Colors.textSecondary,
 },
 sectionTitle: {
  fontSize: FontSize.lg,
  color: Colors.text,
  fontWeight: '600',
  marginBottom: Spacing.xs,
 },
 bodyText: {
  fontSize: FontSize.md,
  color: Colors.textSecondary,
  lineHeight: 22,
 },
 filesContent: {
  gap: Spacing.sm,
 },
 imageGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: Spacing.sm,
 },
 imageThumbButton: {
  width: 96,
  height: 96,
  borderRadius: BorderRadius.md,
  overflow: 'hidden',
  backgroundColor: '#F2F2F2',
  borderWidth: 1,
  borderColor: Colors.border,
 },
 imageThumb: {
  width: '100%',
  height: '100%',
 },
 filesList: {
  gap: Spacing.xs,
 },
 fileRow: {
  minHeight: 42,
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: BorderRadius.md,
  paddingHorizontal: Spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,
 },
 fileText: {
  flex: 1,
  fontSize: FontSize.sm,
  color: Colors.text,
 },
 centerContent: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: Spacing.xs,
 },
 emptyTitle: {
  fontSize: FontSize.lg,
  color: Colors.text,
  fontWeight: '600',
 },
 emptyText: {
  fontSize: FontSize.md,
  color: Colors.textSecondary,
  textAlign: 'center',
 },
});
