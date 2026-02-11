class InstallmentScheduleGenerator
  def initialize(debt)
    @debt = debt
  end

  def generate!
    case @debt.installment_type
    when "lump_sum"
      generate_lump_sum
    when "monthly"
      generate_periodic(1.month)
    when "bi_weekly"
      generate_periodic(2.weeks)
    when "quarterly"
      generate_periodic(3.months)
    when "yearly"
      generate_periodic(12.months)
    when "custom_split"
      []
    else
      []
    end
  end

  private

  def generate_lump_sum
    [ create_installment(amount: @debt.amount, due_date: @debt.deadline) ]
  end

  def generate_periodic(interval)
    start_date = @debt.created_at.to_date
    due_dates = []
    current_date = start_date + interval

    while current_date <= @debt.deadline
      due_dates << current_date
      current_date += interval
    end

    due_dates << @debt.deadline if due_dates.empty? || due_dates.last != @debt.deadline

    count = due_dates.size
    base_amount = (@debt.amount / count).floor(2)
    remainder = @debt.amount - (base_amount * (count - 1))

    due_dates.each_with_index.map do |due_date, index|
      amount = index == count - 1 ? remainder : base_amount
      create_installment(amount: amount, due_date: due_date)
    end
  end

  def create_installment(amount:, due_date:)
    @debt.installments.create!(
      amount: amount,
      due_date: due_date,
      status: "upcoming"
    )
  end
end
