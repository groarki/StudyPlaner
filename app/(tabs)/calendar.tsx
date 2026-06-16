import { useState } from 'react';
import {
 Alert,
 View,
 Text,
 StyleSheet,
 FlatList,
 TouchableOpacity,
 ActivityIndicator,
} from 'react-native';
import { CirclePlus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { useLecturesStore } from '../../store';
import { Lecture } from '../../types';
import WeekDayPicker from '../../components/calendar/weekday-picker';
import LectureCard from '../../components/lectures/lecture-card';
import LectureActionsModal from '../../components/ui/modals/lecture-actions-modal';
import ConfirmDeleteModal from '../../components/ui/modals/confirm-delete-modal';
import LectureDetailsModal from '../../components/ui/modals/lecture-details-modal';
import ScreenWrapper from '../../components/screen-wrapper';
import { hydrateAppData } from '../../utils/hydrate-app-data';

export default function CalendarScreen() {
 const [selectedDate, setSelectedDate] = useState(new Date());
 const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
 const [detailsLecture, setDetailsLecture] = useState<Lecture | null>(null);
 const [isActionModalVisible, setIsActionModalVisible] = useState(false);
 const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const { lectures, isLoading, error, deleteLecture } = useLecturesStore();

 const dayLectures = lectures
  .filter((lecture) => lecture.dayOfWeek === selectedDate.getDay())
  .sort((a, b) => a.startTime.localeCompare(b.startTime));

 const openDeleteConfirmation = () => {
  if (!selectedLecture || isDeleting) return;
  setIsActionModalVisible(false);
  setIsConfirmDeleteVisible(true);
 };

 const closeDeleteConfirmation = () => {
  if (isDeleting) return;
  setIsConfirmDeleteVisible(false);
 };

 const handleEditLecture = () => {
  if (!selectedLecture) return;
  setIsActionModalVisible(false);
  router.push(`/add-lecture?lectureId=${selectedLecture.id}`);
 };

 const handleDeleteLecture = async () => {
  if (!selectedLecture || isDeleting) return;

  setIsDeleting(true);
  try {
   const isDeleted = await deleteLecture(selectedLecture.id);
   if (isDeleted) {
    setSelectedLecture(null);
    setIsActionModalVisible(false);
    setIsConfirmDeleteVisible(false);
   } else {
    Alert.alert('Unable to delete lecture', useLecturesStore.getState().error ?? 'Please try again.');
   }
  } finally {
   setIsDeleting(false);
  }
 };

 return (
  <ScreenWrapper>
   <View style={styles.header}>
    <View style={styles.headerLeft}>
     <Text style={styles.title}>Calendar</Text>
     <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-lecture')}>
      <CirclePlus size={28} />
     </TouchableOpacity>
    </View>
    <View style={styles.monthBadge}>
     <Text style={styles.monthText}>
      {new Intl.DateTimeFormat(undefined, { month: 'long' }).format(selectedDate)}
     </Text>
    </View>
   </View>

   <WeekDayPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />

   <View style={styles.timelineContainer}>
    {!isLoading && dayLectures.length > 0 ? <View style={styles.timelineRail} /> : null}
    <FlatList
     data={isLoading ? [] : dayLectures}
     keyExtractor={(lecture) => lecture.id}
     style={styles.timeline}
     showsVerticalScrollIndicator={false}
     contentContainerStyle={styles.timelineContent}
     ListEmptyComponent={
       isLoading ? (
         <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
       ) : error && lectures.length === 0 ? (
        <View style={styles.emptyContainer}>
         <Text style={styles.emptyText}>Unable to load lectures</Text>
         <Text style={styles.emptySubtext}>{error}</Text>
         <TouchableOpacity style={styles.retryButton} activeOpacity={0.85} onPress={hydrateAppData}>
          <Text style={styles.retryButtonText}>Retry</Text>
         </TouchableOpacity>
        </View>
       ) : (
         <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lectures today</Text>
        <Text style={styles.emptySubtext}>Tap + to add a lecture</Text>
       </View>
      )
     }
        renderItem={({ item: lecture }) => (
         <View style={styles.lectureRow}>
       <View style={styles.timelineDot} />
       <View style={styles.lectureCardWrapper}>
        <LectureCard
         lecture={lecture}
         onPress={() => {
           setSelectedLecture(lecture);
           setIsActionModalVisible(true);
         }}
         onDetailsPress={() => setDetailsLecture(lecture)}
        />
       </View>
      </View>
     )}
    />
   </View>

   <LectureActionsModal
    visible={isActionModalVisible}
    onClose={() => {
     if (isDeleting) return;
     setIsActionModalVisible(false);
    }}
    onEdit={handleEditLecture}
    onDelete={openDeleteConfirmation}
    disabled={isDeleting}
   />

   <ConfirmDeleteModal
    visible={isConfirmDeleteVisible}
    isDeleting={isDeleting}
    onCancel={closeDeleteConfirmation}
    onConfirm={handleDeleteLecture}
   />

   <LectureDetailsModal
    visible={Boolean(detailsLecture)}
    lecture={detailsLecture}
    onClose={() => setDetailsLecture(null)}
   />
  </ScreenWrapper>
 );
}

const styles = StyleSheet.create({
 header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: Spacing.md,
  width: '100%',
  paddingBottom: Spacing.sm,
 },
 headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,
 },
 title: {
  fontSize: FontSize.xxl,
  fontWeight: 'bold',
  color: Colors.text,
 },
 addButton: {
  padding: 2,
 },
 monthBadge: {
  borderRadius: 20,
  paddingHorizontal: Spacing.lg,
 },
 monthText: {
  color: Colors.text,
  fontSize: FontSize.xl,
  fontWeight: '600',
 },
 timelineContainer: {
  flex: 1,
  position: 'relative',
 },
 timeline: {
  flex: 1,
  marginHorizontal: -16,
  paddingHorizontal: 16,
 },
 timelineContent: {
  paddingTop: Spacing.md,
  paddingBottom: Spacing.xl,
 },
 loadingIndicator: {
  marginTop: 40,
 },
 lectureRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: Spacing.sm,
  marginBottom: Spacing.md,
 },
 timelineRail: {
  position: 'absolute',
  left: 3,
  top: Spacing.md,
  bottom: Spacing.xl,
  width: 1,
  backgroundColor: '#8E9595',
 },
 timelineDot: {
  width: 7,
  height: 7,
  borderRadius: 5,
  backgroundColor: '#687070',
 },
 lectureCardWrapper: {
  flex: 1,
 },
 emptyContainer: {
  alignItems: 'center',
  marginTop: 60,
  gap: Spacing.sm,
 },
 emptyText: {
  fontSize: FontSize.lg,
  color: Colors.textSecondary,
  fontWeight: '500',
 },
 emptySubtext: {
  fontSize: FontSize.md,
  color: Colors.textSecondary,
 },
 retryButton: {
  borderRadius: 22,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.sm,
  backgroundColor: Colors.primary,
 },
 retryButtonText: {
  fontSize: FontSize.md,
  color: Colors.background,
  fontWeight: '600',
 },
});
