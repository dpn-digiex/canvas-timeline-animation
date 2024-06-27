// * Animation Rule on TIMELINE

// * Dòng thời gian của 1 Page (pageDuration) được chia làm 3 giai đoạn tuần tự:
// 1. Play animation enter cho các elements (enterDuration)
// 2. Animation không thực hiện gì trong khoảng thời gian này (remainingDuration)
// 3. Play animation exit cho các elements (exitDuration)
// -> Thỏa mãn điều kiện: enterDuration + exitDuration + remainingDuration = pageDuration

// * enterDuration và exitDuration được tính toán dựa vào tổng thời lượng mà các element có nhãn enter hay exit tương ứng play hoàn thành, một số điều kiện khác:
// + các element có thể play xen kẽ nhau mà không cần đợi cho các animation khác hoàn thành
// + mỗi element sẽ play delay dựa vào index của nó trong mảng children được render vào template theo công thức: elementIndex * 0.2

// * Ví dụ: Template có thời lượng 5s với 2 elements
// + element thứ nhất có duration animation cho cả enter và exit là 1s
// + element thứ hai có duration animation cho enter là 0.8s và cho exit là 0.6s
// như vậy:
// + element thứ nhất trên dòng thời gian của timeline sẽ play enter từ 0s -> 1s
// + element thứ nhất trên dòng thời gian của timeline sẽ play enter từ 0.2s -> 1s
// => tổng thời lượng enterDuration là 1s
// dòng thời gian của chúng ta sẽ còn từ giây thứ 1 -> 5s cho remainingDuration và exitDuration
// áp dụng cách tính tương tự đưa ý tưởng của tôi về các công thức và thực hiện tính toán remainingDuration và exitDuration

const template = [
  {
    pageIndex: 0,
    pageId: 'page1',
    pageDuration: 5,
    elements: [
      { id: '#page1-element1', enter: 1, exit: 1 },
      { id: '#page1-element2', enter: 1.2, exit: 0.6 },
      { id: '#page1-element3', enter: 0.8, exit: 0 },
    ],
  },
  {
    pageIndex: 1,
    pageId: 'page2',
    pageDuration: 4,
    elements: [
      { id: '#page2-element1', enter: 5, exit: 1 },
      { id: '#page2-element2', enter: 1, exit: 0.8 },
    ],
  },
  {
    pageIndex: 2,
    pageId: 'page3',
    pageDuration: 6,
    elements: [
      { id: '#page3-element1', enter: 0, exit: 0.5 },
      { id: '#page3-element2', enter: 0, exit: 0.6 },
    ],
  },
];

const delayElementPlay = 0.2;

function calculateDurations(elements, pageDuration) {
  let enterDuration = 0;
  let exitDuration = 0;
  let remainingDuration = 0;

  elements.forEach((element, index) => {
    if (element.enter > 0) {
      enterDuration = +Math.max(enterDuration, element.enter + index * delayElementPlay).toFixed(1);
    }
    if (element.exit > 0) {
      exitDuration = +Math.max(exitDuration, element.exit + index * delayElementPlay).toFixed(1);
    }
  });

  // Điều chỉnh theo quy tắc
  if (enterDuration > pageDuration) {
    enterDuration = pageDuration;
    exitDuration = 0;
    remainingDuration = 0;
  } else if (enterDuration + exitDuration > pageDuration) {
    exitDuration = pageDuration - enterDuration;
    remainingDuration = 0;
  } else {
    remainingDuration = +(pageDuration - enterDuration - exitDuration).toFixed(1);
  }

  return { enterDuration, remainingDuration, exitDuration };
}

const templateDuration = template.reduce((total, page) => total + page.pageDuration, 0);
console.log('templateDuration', templateDuration);
template.forEach((page, index) => {
  const { enterDuration, remainingDuration, exitDuration } = calculateDurations(page.elements, page.pageDuration);
  console.log(`page-${index}`, { enterDuration, remainingDuration, exitDuration });
});

// const masterTimeline = gsap.timeline();
// template.forEach((page) => {
//   const { enterDuration, remainingDuration, exitDuration } = calculateDurations(page.elements, page.pageDuration);
//   const pageTimeline = gsap.timeline();
//   page.elements.forEach((element, index) => {
//     const delay = index * 0.2;
//     if (element.enter > 0) {
//       pageTimeline.add(gsap.to(element.id, { duration: element.enter, x: 100, opacity: 1 }), delay);
//     }
//     if (element.exit > 0) {
//       pageTimeline.add(
//         gsap.to(element.id, { duration: element.exit, x: 0, opacity: 0 }),
//         enterDuration + remainingDuration + delay,
//       );
//     }
//   });
//   // Ensure pageTimeline duration matches the page duration
//   pageTimeline.duration(page.pageDuration);
//   // Add pageTimeline to masterTimeline with appropriate delay
//   masterTimeline.add(pageTimeline, page.pageIndex * page.pageDuration);
// });
// // Ensure masterTimeline duration matches the template duration
// masterTimeline.duration(templateDuration);
