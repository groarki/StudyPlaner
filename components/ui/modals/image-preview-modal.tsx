import { useEffect, useRef } from 'react';
import {
 Animated,
 Dimensions,
 Modal,
 StyleSheet,
 TouchableOpacity,
 View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X } from 'lucide-react-native';
import { Colors, Spacing } from '../../../constants/theme';

type ImagePreviewModalProps = {
 visible: boolean;
 imageUri: string | null;
 onClose: () => void;
};

const MAX_SCALE = 4;

export default function ImagePreviewModal({ visible, imageUri, onClose }: ImagePreviewModalProps) {
 const baseScale = useRef(new Animated.Value(1)).current;
 const pinchScale = useRef(new Animated.Value(1)).current;
 const lastScale = useRef(1);
 const scale = Animated.multiply(baseScale, pinchScale);

 useEffect(() => {
  if (!visible) return;

  lastScale.current = 1;
  baseScale.setValue(1);
  pinchScale.setValue(1);
 }, [baseScale, imageUri, pinchScale, visible]);

 const pinchGesture = Gesture.Pinch()
  .onUpdate((event) => {
   pinchScale.setValue(event.scale);
  })
  .onEnd((event) => {
   const nextScale = Math.min(Math.max(lastScale.current * event.scale, 1), MAX_SCALE);
   lastScale.current = nextScale;
   baseScale.setValue(nextScale);
   pinchScale.setValue(1);
  });

 return (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
   <View style={styles.backdrop}>
    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
     <X size={26} color={Colors.background} />
    </TouchableOpacity>

    {imageUri ? (
     <GestureDetector gesture={pinchGesture}>
      <Animated.View style={styles.imageHost}>
       <Animated.Image
        source={{ uri: imageUri }}
        style={[styles.image, { transform: [{ scale }] }]}
        resizeMode="contain"
       />
      </Animated.View>
     </GestureDetector>
    ) : null}
   </View>
  </Modal>
 );
}

const styles = StyleSheet.create({
 backdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.92)',
  alignItems: 'center',
  justifyContent: 'center',
 },
 closeButton: {
  position: 'absolute',
  top: 80,
  right: Spacing.sm,
  zIndex: 2,
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.16)',
 },
 imageHost: {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  alignItems: 'center',
  justifyContent: 'center',
 },
 image: {
  width: '100%',
  height: '100%',
 },
});
