export type CalendarDay = {
  day: number;
  isCurrentMonth: boolean;
  month: number;
  year: number;
};

export class CalendarUtils {
  static getDaysInMonth(date: Date): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const days: CalendarDay[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Previous month days
    for (let i = adjustedStart - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        month: month,
        year: year
      });
    }
    
    // Next month days
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year
      });
    }
    
    return days;
  }
}