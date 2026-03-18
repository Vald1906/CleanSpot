import { describe, it, expect, vi } from "vitest";
import SpotFormModal from "@/app/components/SpotFormModal";
import { render, screen, fireEvent } from "@testing-library/react";

//tests unitaires
describe('addition', () => {  //ce quon test
    it('tests with negative numbers', () => { //ce qui est entrain detre tester dans la fonction
        const leftNumber: number = -1;
        const rightNumber: number = -2;
        const result: number = leftNumber + rightNumber;

        expect(result).toBe(-3);
    });
    it('tests with positive numbers', () => { //ce qui est entrain detre tester dans la fonction
        const leftNumber: number = 1;
        const rightNumber: number = 2;
        const result: number = leftNumber + rightNumber;

        expect(result).toBe(3);
    });


    //tests fonctionnels
    it('demo mock', () => {
        const object = {};
        const demoSpy = vi.spyOn(object, 'methodExample');


        expect(demoSpy).toHaveBeenCalledTimes(2);
    });

});

describe('SpotFormModal', () => {
    it('devrait appeler onClose() lors du clic sur le bouton annuler', () => {
        const mockOnClose = vi.fn();
        const mockOnSubmit = vi.fn();
        // 1. Trouver le bouton "Annuler"
        const cancelButton = screen.getByText('Annuler');

        // 2. Simuler un clic de l'utilisateur 
        fireEvent.click(cancelButton);
        // 3. Vérifier que la fonction onClose a bien été appelée 1 fois
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
    
});