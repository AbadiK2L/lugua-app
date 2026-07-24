import { ProfileMenuRow } from "@/src/components/profile/ProfileMenuRow";
import { ProfileSection } from "@/src/components/profile/ProfileSection";
import type { ProfileSharedActions } from "@/src/types/profile";

type ProfileAccountSectionProps = {
  actions: Pick<
    ProfileSharedActions,
    "onExitDemo" | "onOpenAbout" | "onOpenSources" | "onOpenPrivacy"
  >;
};

export function ProfileAccountSection({
  actions,
}: ProfileAccountSectionProps) {
  return (
    <ProfileSection title="Compte">
      <ProfileMenuRow
        icon="info.circle.fill"
        label="À propos de Lugua"
        value="Lugua"
        onPress={actions.onOpenAbout}
        accessibilityHint="Affiche les informations sur Lugua"
        isLast={false}
      />
      <ProfileMenuRow
        icon="book.fill"
        label="Sources linguistiques"
        value="Curriculum local"
        onPress={actions.onOpenSources}
        accessibilityHint="Affiche les sources linguistiques actuelles"
        isLast={false}
      />
      <ProfileMenuRow
        icon="lock.fill"
        label="Confidentialité"
        value="En préparation"
        onPress={actions.onOpenPrivacy}
        accessibilityHint="Affiche l’état de préparation de la confidentialité"
        isLast={false}
      />
      <ProfileMenuRow
        icon="rectangle.portrait.and.arrow.right"
        label="Quitter le mode de démonstration"
        value="Retour à l’accueil"
        onPress={actions.onExitDemo}
        accessibilityHint="Efface la session locale et revient à la sélection du rôle"
        isLast
      />
    </ProfileSection>
  );
}
