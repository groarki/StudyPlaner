import { useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, CirclePlus, Ellipsis } from 'lucide-react-native';
import { useProfileStore } from '../../../store';
import AddLinkModal from '../../../components/ui/modals/add-link-modal';
import ConfirmDeleteModal from '../../../components/ui/modals/confirm-delete-modal';
import ScreenWrapper from '../../../components/screen-wrapper';
import { Colors, FontSize, Spacing } from '../../../constants/theme';
import type { HelpfulLink } from '../../../types';
import { getValidUrl } from '../../../utils';

export default function HelpfulLinksScreen() {
 const { helpfulLinks, addHelpfulLink, removeHelpfulLink } = useProfileStore();
 const [isAddLinkVisible, setIsAddLinkVisible] = useState(false);
 const [selectedLink, setSelectedLink] = useState<HelpfulLink | null>(null);
 const [linkTitle, setLinkTitle] = useState('');
 const [linkUrl, setLinkUrl] = useState('');

 const openHelpfulLink = async (url: string) => {
  const validUrl = getValidUrl(url);

  if (!validUrl) {
   Alert.alert('Unable to open link', 'Please check that the link is valid.');
   return;
  }

  const canOpen = await Linking.canOpenURL(validUrl);

  if (!canOpen) {
   Alert.alert('Unable to open link', 'Please check that the link is valid.');
   return;
  }

  await Linking.openURL(validUrl);
 };

 const handleSaveLink = () => {
  const title = linkTitle.trim();
  const url = linkUrl.trim();

  if (!title || !url) {
   Alert.alert('Missing details', 'Please enter a title and a link.');
   return;
  }

  const validUrl = getValidUrl(url);

  if (!validUrl) {
   Alert.alert(
    'Invalid link',
    'Please enter a valid website link, for example https://example.com.'
   );
   return;
  }

  addHelpfulLink({
   id: `${Date.now()}`,
   title,
   url: validUrl,
  });

  setLinkTitle('');
  setLinkUrl('');
  setIsAddLinkVisible(false);
 };

 const closeDeleteModal = () => {
  setSelectedLink(null);
 };

 const handleDeleteLink = () => {
  if (!selectedLink) return;

  removeHelpfulLink(selectedLink.id);
  closeDeleteModal();
 };

 return (
  <ScreenWrapper>
   <View style={styles.header}>
    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
     <ChevronLeft size={24} color={Colors.text} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Helpful links</Text>
    <TouchableOpacity style={styles.iconButton} onPress={() => setIsAddLinkVisible(true)}>
     <CirclePlus size={26} color={Colors.text} strokeWidth={1.6} />
    </TouchableOpacity>
   </View>

   <FlatList
    data={helpfulLinks}
    keyExtractor={(link) => link.id}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.content}
    ListEmptyComponent={<Text style={styles.emptyText}>No saved links yet.</Text>}
    renderItem={({ item: link }) => (
     <View style={styles.linkRow}>
      <TouchableOpacity
       style={styles.linkMain}
       activeOpacity={0.85}
       onPress={() => openHelpfulLink(link.url)}
      >
       <Text style={styles.linkTitle} numberOfLines={1}>
        {link.title}
       </Text>
      </TouchableOpacity>
      <TouchableOpacity
       style={styles.moreButton}
       activeOpacity={0.75}
       onPress={() => setSelectedLink(link)}
      >
       <Ellipsis size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
     </View>
    )}
   />

   <AddLinkModal
    visible={isAddLinkVisible}
    title={linkTitle}
    url={linkUrl}
    onChangeTitle={setLinkTitle}
    onChangeUrl={setLinkUrl}
    onClose={() => setIsAddLinkVisible(false)}
    onSave={handleSaveLink}
   />

   <ConfirmDeleteModal
    visible={!!selectedLink}
    title="Delete link?"
    message={selectedLink ? `Remove "${selectedLink.title}" from helpful links?` : undefined}
    onCancel={closeDeleteModal}
    onConfirm={handleDeleteLink}
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
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
 },
 headerTitle: {
  fontSize: FontSize.lg,
  color: Colors.text,
  fontWeight: '700',
 },
 content: {
  paddingBottom: Spacing.xl,
 },
 linkRow: {
  minHeight: 44,
  borderWidth: 1,
  borderRadius: 11,
  borderColor: Colors.textSecondary,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'hidden',
  marginBottom: Spacing.sm,
 },
 linkMain: {
  flex: 1,
  minHeight: 44,
  justifyContent: 'center',
  paddingLeft: 12,
  paddingRight: Spacing.sm,
 },
 linkTitle: {
  fontSize: FontSize.md,
  color: Colors.text,
 },
 moreButton: {
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
 },
 emptyText: {
  color: Colors.textSecondary,
  fontSize: FontSize.md,
  textAlign: 'center',
  paddingVertical: Spacing.xl,
 },
});
