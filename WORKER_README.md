# Canvas Animation Worker với OffscreenCanvas

Đây là implementation của Canvas Animation Worker sử dụng OffscreenCanvas để mô phỏng quá trình render và animation từ sample code chính, sử dụng Konva và GSAP.

## 🎯 Tính năng

- ✅ Sử dụng **OffscreenCanvas** để render trong Web Worker
- ✅ Tích hợp **Konva.js** cho việc render elements
- ✅ Tích hợp **GSAP** cho animations với các custom eases
- ✅ Hỗ trợ nhiều loại elements: Image, Text, Video (placeholder), Rect
- ✅ Hệ thống animation tương tự sample chính với các hiệu ứng: fade, rise, pop, zoom, baseline, v.v.
- ✅ Timeline control: play, pause, resume, reset, seek
- ✅ Frame capture cho export video
- ✅ Event system để giao tiếp với main thread

## 📁 Cấu trúc File

```
src/
├── workers/
│   ├── canvasAnimationWorker.js    # Worker chính với logic render và animation
│   └── WorkerManager.js            # Interface để giao tiếp với worker
├── CanvasWorkerDemo.tsx            # Demo component để test worker
└── main.tsx                        # Updated để chọn demo
```

## 🚀 Cách sử dụng

### 1. Khởi chạy Demo

```bash
npm run dev
```

Mở trình duyệt và bạn sẽ thấy hai tab:

- **Original (Main Thread)**: Sample code gốc
- **Worker Demo (OffscreenCanvas)**: Worker implementation mới

### 2. Sử dụng Worker trong Code

```javascript
import { WorkerManager } from './workers/WorkerManager';

// Khởi tạo
const workerManager = new WorkerManager();
await workerManager.initialize(canvasElement, { width: 800, height: 500 });

// Load scene data (tương tự PAGES format)
const sceneData = {
  backgroundColor: '#ef8920',
  children: [
    {
      id: 'element_01',
      x: 100,
      y: 100,
      elementType: 'image',
      src: 'image_url.jpg',
      width: 150,
      height: 150,
    },
  ],
  animationsApply: [
    {
      id: 'element_01',
      animationId: 'pop',
      speed: 1,
      delay: 0,
    },
  ],
};

workerManager.loadScene(sceneData);

// Control animation
workerManager.play();
workerManager.pause();
workerManager.reset();
```

### 3. Event Handling

```javascript
// Lắng nghe events từ worker
workerManager.on('timeline-update', (data) => {
  console.log('Progress:', data.progress);
  console.log('Time:', data.time);
});

workerManager.on('timeline-complete', () => {
  console.log('Animation completed!');
});

workerManager.on('frame-captured', (data) => {
  console.log('Frame captured:', data.dataURL);
});
```

## 🎨 Supported Animations

Worker hỗ trợ các animation types giống như sample chính:

### Basic Animations

- **fade**: Fade in/out
- **rise**: Di chuyển với direction (up, down, left, right)
- **pop**: Scale từ nhỏ đến lớn với elastic effect
- **zoom**: Scale lên 1.2x
- **baseline**: Reveal với direction
- **neon**: Blinking effect

### Advanced Animations

- **breath**: Scale thở với direction
- **typewriter**: Typewriting effect (đang develop)
- **ascend**: Text ascend với stagger
- **burst**: Burst effect với stagger
- **skate**: Skate effect với rotation

## 🔧 Configuration

### Scene Data Format

```javascript
{
  backgroundColor: '#color',
  children: [
    {
      id: 'unique_id',
      elementType: 'image' | 'text' | 'video' | 'rect',
      x: number,
      y: number,
      width: number,
      height: number,
      // Specific props for each type
      src: 'url',           // for image/video
      text: 'string',       // for text
      fontSize: number,     // for text
      fontFamily: 'string', // for text
      fill: '#color',       // for text
      // ... other props
    }
  ],
  animationsApply: [
    {
      id: 'element_id',
      animationId: 'animation_name',
      speed: number,        // duration in seconds
      delay: number,        // delay in seconds
      direction: 'direction_up' | 'direction_down' | 'direction_left' | 'direction_right',
      scale: 'scale_in' | 'scale_out',
      // ... other props
    }
  ]
}
```

## 🎮 Demo Controls

Demo component cung cấp:

1. **Initialize Worker**: Khởi tạo worker với OffscreenCanvas
2. **Load Scene**: Load demo scene data
3. **Animation Controls**: Play, Pause, Resume, Reset
4. **Timeline Slider**: Seek đến thời điểm bất kỳ
5. **Capture Frame**: Chụp frame hiện tại
6. **Clear Elements**: Xóa tất cả elements
7. **Real-time Logs**: Theo dõi hoạt động của worker

## 🔍 Technical Details

### OffscreenCanvas Support

- Worker sử dụng `canvas.transferControlToOffscreen()` để có quyền kiểm soát canvas
- Rendering được thực hiện hoàn toàn trong worker thread
- Main thread chỉ cần setup canvas và nhận events

### GSAP Integration

- Tất cả GSAP plugins được register trong worker
- Custom eases được tạo giống như main thread
- Timeline system hoạt động độc lập trong worker

### Konva Integration

- Konva Stage được khởi tạo với OffscreenCanvas
- Elements được tạo và quản lý trong worker memory
- Batch drawing để optimize performance

### Performance Benefits

- Animation logic chạy trong worker thread → không block UI
- Rendering được optimize với batch drawing
- Memory management tốt hơn với element mapping

## 🐛 Known Issues & Limitations

1. **Video Elements**: Hiện tại chỉ có placeholder, chưa implement đầy đủ
2. **Font Loading**: Cần setup font loading trong worker context
3. **Complex Text Effects**: Typewriter effects cần development thêm
4. **Cross-Origin Images**: Cần CORS setup cho external images
5. **Browser Support**: Cần kiểm tra OffscreenCanvas support

## 🔄 So sánh với Main Thread

| Feature          | Main Thread              | Worker Thread              |
| ---------------- | ------------------------ | -------------------------- |
| UI Blocking      | ❌ Block UI khi animate  | ✅ Không block UI          |
| Performance      | ⚠️ Depends on complexity | ✅ Better isolation        |
| Debugging        | ✅ Easy debugging        | ⚠️ Worker debugging harder |
| DOM Access       | ✅ Full access           | ❌ Limited access          |
| Setup Complexity | ✅ Simple                | ⚠️ More complex            |

## 📝 Development Notes

- Worker code không thể access DOM trực tiếp
- Tất cả communication phải qua postMessage
- Error handling cần careful để avoid worker crash
- Testing worker cần special setup

## 🚧 Future Enhancements

- [ ] Full video element support với actual video rendering
- [ ] Advanced text effects (typewriter, character-by-character)
- [ ] Better font loading system
- [ ] Multiple worker support cho complex scenes
- [ ] WebGL backend option
- [ ] Advanced frame export với multiple formats
- [ ] Performance monitoring và profiling tools

## 📚 Resources

- [OffscreenCanvas MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [Konva.js Documentation](https://konvajs.org/docs/)
- [GSAP Documentation](https://gsap.com/docs/v3/)
- [Web Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
