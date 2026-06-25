/**
 * Base class for value objects.
 *
 * A value object has no identity and is compared by the structural equality of
 * its attributes. Its props are frozen on construction to enforce immutability.
 * This class must not depend on infrastructure.
 */
export abstract class ValueObject<TProps extends object> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  /**
   * Value objects are equal when they are of the same type and hold the same
   * attribute values.
   */
  public equals(other?: ValueObject<TProps>): boolean {
    if (other === undefined || other === null) {
      return false;
    }

    if (other.constructor !== this.constructor) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  public toObject(): Readonly<TProps> {
    return this.props;
  }
}
